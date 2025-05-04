import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  fetchHarvests, 
  createHarvest, 
  updateHarvest, 
  deleteHarvest
} from '../utils/api';

export function useHarvests(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['harvests', startDate, endDate],
    queryFn: () => fetchHarvests(startDate, endDate)
  });
}

export function useCreateHarvest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}

export function useUpdateHarvest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}

export function useDeleteHarvest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteHarvest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['harvests'] });
    },
  });
}