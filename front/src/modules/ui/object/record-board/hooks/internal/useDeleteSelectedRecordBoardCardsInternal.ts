import { useApolloClient } from '@apollo/client';
import { useRecoilCallback } from 'recoil';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { Opportunity } from '@/pipeline/types/Opportunity';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';

import { useRemoveRecordBoardCardIdsInternal } from './useRemoveRecordBoardCardIdsInternal';

export const useDeleteSelectedRecordBoardCardsInternal = () => {
  const removeCardIds = useRemoveRecordBoardCardIdsInternal();
  const apolloClient = useApolloClient();

  const { deleteOneRecord: deleteOneOpportunity } =
    useDeleteOneRecord<Opportunity>({
      objectNameSingular: 'opportunity',
    });

  const { selectedCardIdsSelector } = useRecordBoardScopedStates();

  const deleteSelectedBoardCards = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const selectedCardIds = snapshot
          .getLoadable(selectedCardIdsSelector)
          .getValue();

        await Promise.all(
          selectedCardIds.map(async (id) => {
            await deleteOneOpportunity?.(id);
          }),
        );
        removeCardIds(selectedCardIds);
        selectedCardIds.forEach((id) => {
          apolloClient.cache.evict({ id: `Opportunity:${id}` });
        });
      },
    [
      selectedCardIdsSelector,
      removeCardIds,
      deleteOneOpportunity,
      apolloClient.cache,
    ],
  );

  return deleteSelectedBoardCards;
};
