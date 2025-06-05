import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory } from '@/utils/api';
import { CategoryResponse } from '@/types/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createCategory(name, description),
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: ['categories'] });

      const previousCategories = queryClient.getQueryData<CategoryResponse[]>(['categories']) || [];

      const optimisticCategory: CategoryResponse = {
        _id: 'temp-' + Date.now(),
        name: newCategory.name,
        description: newCategory.description,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        order: previousCategories.length + 1, 
      };

      queryClient.setQueryData(
        ['categories'],
        [...previousCategories, optimisticCategory]
      );

      return { previousCategories };
    },
    onError: (_, __, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(['categories'], context.previousCategories);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });
}