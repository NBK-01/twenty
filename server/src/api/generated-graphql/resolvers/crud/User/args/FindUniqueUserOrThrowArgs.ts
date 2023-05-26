import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { UserWhereUniqueInput } from '../../../inputs/UserWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class FindUniqueUserOrThrowArgs {
  @TypeGraphQL.Field((_type) => UserWhereUniqueInput, {
    nullable: false,
  })
  where!: UserWhereUniqueInput;
}