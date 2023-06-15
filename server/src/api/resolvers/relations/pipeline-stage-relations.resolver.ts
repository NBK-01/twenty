import * as TypeGraphQL from '@nestjs/graphql';
import { PipelineProgress } from 'src/api/@generated/pipeline-progress/pipeline-progress.model';
import { PipelineStage } from 'src/api/@generated/pipeline-stage/pipeline-stage.model';
import { PrismaService } from 'src/database/prisma.service';

@TypeGraphQL.Resolver(() => PipelineStage)
export class PipelineStageRelationsResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @TypeGraphQL.ResolveField(() => [PipelineProgress], {
    nullable: false,
  })
  async pipelineProgresses(
    @TypeGraphQL.Root() pipelineStage: PipelineStage,
  ): Promise<PipelineProgress[]> {
    return this.prismaService.pipelineProgress.findMany({
      where: {
        pipelineStageId: {
          equals: pipelineStage.id,
        },
      },
    });
  }
}