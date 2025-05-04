import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BatchOperationRequest, BatchOperationResponse, DescriptionResponse } from '@/types/api';
import { toast } from 'react-hot-toast';

interface OptimisticUpdate {
  queryKey: readonly unknown[];
  previousData: DescriptionResponse[];
}

async function performBatchOperation(operations: BatchOperationRequest[]): Promise<BatchOperationResponse> {
  const response = await fetch('/api/descriptions/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ operations }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to perform batch operation');
  }

  return response.json();
}

export function useBatchOperations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: performBatchOperation,
    onMutate: async (operations) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['descriptions'] });

      // Get all description query keys
      const queryKeys = queryClient.getQueryCache()
        .findAll({
          predicate: (query) => query.queryKey[0] === 'descriptions'
        })
        .map(query => query.queryKey);

      // Store previous states and update optimistically
      const updates: OptimisticUpdate[] = [];

      for (const queryKey of queryKeys) {
        const previousData = queryClient.getQueryData<DescriptionResponse[]>(queryKey) || [];
        updates.push({ 
          queryKey: queryKey as readonly unknown[],
          previousData 
        });

        const updatedData = previousData.reduce<DescriptionResponse[]>((acc, desc) => {
          const operation = operations.find(op => op.id === desc._id);
          if (!operation) {
            acc.push(desc);
          } else if (operation.type === 'update' && operation.data) {
            acc.push({ ...desc, ...operation.data });
          }
          // Skip deleted items
          return acc;
        }, []);

        // Add new items
        const newItems = operations
          .filter(op => op.type === 'create' && op.data)
          .map(op => ({
            _id: `temp-${Date.now()}-${Math.random()}`,
            ...op.data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as DescriptionResponse));

        queryClient.setQueryData(queryKey, [...updatedData, ...newItems]);
      }

      return { updates };
    },
    onError: (_, __, context) => {
      // Rollback on error
      if (context?.updates) {
        for (const { queryKey, previousData } of context.updates) {
          queryClient.setQueryData(queryKey, previousData);
        }
      }
      toast.error('Failed to perform batch operation');
    },
    onSuccess: (result) => {
      if (result.errors?.length) {
        toast.error(`Some operations failed: ${result.errors.length} errors`);
      } else {
        toast.success('Batch operation completed successfully');
      }
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['descriptions'] });
    },
  });
}