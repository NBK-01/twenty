import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 as uuidV4 } from 'uuid';
import { FindOneOptions, Repository } from 'typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { WorkspaceMigrationService } from 'src/metadata/workspace-migration/workspace-migration.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { CreateFieldInput } from 'src/metadata/field-metadata/dtos/create-field.input';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { generateTargetColumnMap } from 'src/metadata/field-metadata/utils/generate-target-column-map.util';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { UpdateFieldInput } from 'src/metadata/field-metadata/dtos/update-field.input';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';

import { FieldMetadataEntity } from './field-metadata.entity';

@Injectable()
export class FieldMetadataService extends TypeOrmQueryService<FieldMetadataEntity> {
  constructor(
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    private readonly objectMetadataService: ObjectMetadataService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {
    super(fieldMetadataRepository);
  }

  override async createOne(
    record: CreateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        record.workspaceId,
        {
          where: {
            id: record.objectMetadataId,
          },
        },
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    const fieldAlreadyExists = await this.fieldMetadataRepository.findOne({
      where: {
        name: record.name,
        objectMetadataId: record.objectMetadataId,
        workspaceId: record.workspaceId,
      },
    });

    if (fieldAlreadyExists) {
      throw new ConflictException('Field already exists');
    }

    const createdFieldMetadata = await super.createOne({
      ...record,
      targetColumnMap: generateTargetColumnMap(record.type, true, record.name),
      options: record.options
        ? record.options.map((option) => ({
            ...option,
            id: uuidV4(),
          }))
        : undefined,
      isActive: true,
      isCustom: true,
    });

    await this.workspaceMigrationService.createCustomMigration(
      record.workspaceId,
      [
        {
          name: objectMetadata.targetTableName,
          action: 'alter',
          columns: this.workspaceMigrationFactory.createColumnActions(
            WorkspaceMigrationColumnActionType.CREATE,
            createdFieldMetadata,
          ),
        } satisfies WorkspaceMigrationTableAction,
      ],
    );

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      record.workspaceId,
    );

    // TODO: Move viewField creation to a cdc scheduler
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        record.workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    // TODO: use typeorm repository
    const view = await workspaceDataSource?.query(
      `SELECT id FROM ${dataSourceMetadata.schema}."view"
      WHERE "objectMetadataId" = '${createdFieldMetadata.objectMetadataId}'`,
    );

    const existingViewFields = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."viewField"
      WHERE "viewId" = '${view[0].id}'`,
    );

    const lastPosition = existingViewFields
      .map((viewField) => viewField.position)
      .reduce((acc, position) => {
        if (position > acc) {
          return position;
        }

        return acc;
      }, -1);

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."viewField"
    ("fieldMetadataId", "position", "isVisible", "size", "viewId")
    VALUES ('${createdFieldMetadata.id}', '${lastPosition + 1}', true, 180, '${
        view[0].id
      }')`,
    );

    return createdFieldMetadata;
  }

  override async updateOne(
    id: string,
    record: UpdateFieldInput,
  ): Promise<FieldMetadataEntity> {
    const existingFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        id,
        workspaceId: record.workspaceId,
      },
    });

    if (!existingFieldMetadata) {
      throw new NotFoundException('Field does not exist');
    }

    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        record.workspaceId,
        {
          where: {
            id: existingFieldMetadata?.objectMetadataId,
          },
        },
      );

    if (!objectMetadata) {
      throw new NotFoundException('Object does not exist');
    }

    // Check if the id of the options has been provided
    if (record.options) {
      for (const option of record.options) {
        if (!option.id) {
          throw new BadRequestException('Option id is required');
        }
      }
    }

    const updatedFieldMetadata = await super.updateOne(id, record);

    if (record.options || record.defaultValue) {
      await this.workspaceMigrationService.createCustomMigration(
        existingFieldMetadata.workspaceId,
        [
          {
            name: objectMetadata.targetTableName,
            action: 'alter',
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.ALTER,
              existingFieldMetadata,
              updatedFieldMetadata,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ],
      );

      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        updatedFieldMetadata.workspaceId,
      );
    }

    return updatedFieldMetadata;
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<FieldMetadataEntity>,
  ) {
    return this.fieldMetadataRepository.findOne({
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });
  }

  public async deleteFieldsMetadata(workspaceId: string) {
    await this.fieldMetadataRepository.delete({ workspaceId });
  }
}
