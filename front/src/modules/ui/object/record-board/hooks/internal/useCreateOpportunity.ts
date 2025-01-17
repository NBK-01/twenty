import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { recordBoardCardIdsByColumnIdFamilyState } from '@/ui/object/record-board/states/recordBoardCardIdsByColumnIdFamilyState';

export const useCreateOpportunity = () => {
  const { createOneRecord: createOneOpportunity } =
    useCreateOneRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const createOpportunity = useRecoilCallback(
    ({ set }) =>
      async (companyId: string, pipelineStepId: string) => {
        const newUuid = v4();

        set(
          recordBoardCardIdsByColumnIdFamilyState(pipelineStepId),
          (oldValue) => [...oldValue, newUuid],
        );

        await createOneOpportunity?.({
          id: newUuid,
          pipelineStepId,
          companyId: companyId,
        });
      },
    [createOneOpportunity],
  );

  return createOpportunity;
};
