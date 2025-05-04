import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchDescriptions, 
  createDescription, 
  updateDescription, 
  deleteDescription 
} from '../utils/api';
import { 
  DescriptionResponse, 
  CreateDescriptionRequest,
  UpdateDescriptionRequest 
} from '../types/api';

interface MutationContext {
  previousDescriptions?: DescriptionResponse[];
  previousQueries?: Map<unknown[], DescriptionResponse[]>;
}

export function useDescriptions(params?: { categoryId?: string; parentId?: string }) {
  return useQuery<DescriptionResponse[]>({
    queryKey: ['descriptions', params?.categoryId, params?.parentId],
    queryFn: () => fetchDescriptions(params)
  });
}

export function useCreateDescription() {
  const queryClient = useQueryClient();
  
  return useMutation<DescriptionResponse, Error, CreateDescriptionRequest, MutationContext>({
    mutationFn: createDescription,
    onMutate: async (newDescription) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ 
        queryKey: ['descriptions'] 
      });

      // Get all the current queries for descriptions
      const queryKeys = queryClient.getQueryCache()
        .findAll({ queryKey: ['descriptions'] })
        .map(query => query.queryKey);

      // Snapshot the previous value
      const previousQueries = new Map();
      for (const queryKey of queryKeys) {
        const data = queryClient.getQueryData<DescriptionResponse[]>(queryKey) || [];
        previousQueries.set(queryKey, data);

        // Only update queries that match the category
        if (queryKey[1] === newDescription.categoryId) {
          const optimisticDescription: DescriptionResponse = {
            _id: 'temp-' + Date.now(),
            description: newDescription.description,
            category: { 
              _id: newDescription.categoryId,
              name: '',
              status: 'active',
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            createdBy: newDescription.userId,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          queryClient.setQueryData(queryKey, [...data, optimisticDescription]);
        }
      }

      return { previousQueries };
    },
    onError: (_, __, context) => {
      // If the mutation fails, restore all queries to their previous values
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      // Invalidate and refetch all description queries
      queryClient.invalidateQueries({ queryKey: ['descriptions'] });
    }
  });
}

export function useUpdateDescription() {
  const queryClient = useQueryClient();
  
  return useMutation<DescriptionResponse, Error, { id: string, updates: UpdateDescriptionRequest }, MutationContext>({
    mutationFn: ({ id, updates }) => updateDescription(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['descriptions'] });

      const queryKeys = queryClient.getQueryCache()
        .findAll({ queryKey: ['descriptions'] })
        .map(query => query.queryKey);

      const previousQueries = new Map();
      for (const queryKey of queryKeys) {
        const data = queryClient.getQueryData<DescriptionResponse[]>(queryKey);
        if (data) {
          previousQueries.set(queryKey, data);
          
          const updatedData = data.map(desc =>
            desc._id === id ? { ...desc, ...updates, updatedAt: new Date().toISOString() } : desc
          );
          
          queryClient.setQueryData(queryKey, updatedData);
        }
      }

      return { previousQueries };
    },
    onError: (_, __, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptions'] });
    }
  });
}

export function useDeleteDescription() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string, MutationContext>({
    mutationFn: deleteDescription,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['descriptions'] });

      const queryKeys = queryClient.getQueryCache()
        .findAll({ queryKey: ['descriptions'] })
        .map(query => query.queryKey);

      const previousQueries = new Map();
      for (const queryKey of queryKeys) {
        const data = queryClient.getQueryData<DescriptionResponse[]>(queryKey);
        if (data) {
          previousQueries.set(queryKey, data);
          
          const updatedData = data.filter(desc => desc._id !== id);
          queryClient.setQueryData(queryKey, updatedData);
        }
      }

      return { previousQueries };
    },
    onError: (_, __, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['descriptions'] });
    }
  });
}