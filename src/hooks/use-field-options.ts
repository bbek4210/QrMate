import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { userQueryKeys } from '@/lib/query-keys';
import { Field } from '@/types/api';

export interface FieldOption {
  id: number;
  name: string;
}

export const useFieldOptions = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: userQueryKeys.fields(),
    queryFn: api.user.getFields,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: 1000,
    placeholderData: [
      { id: 1, name: 'Blockchain' },
      { id: 2, name: 'Web3' },
      { id: 3, name: 'DeFi' },
      { id: 4, name: 'NFT' },
      { id: 5, name: 'Gaming' },
      { id: 6, name: 'AI/ML' },
      { id: 7, name: 'Startup' },
      { id: 8, name: 'Investment' },
    ] as Field[],
  });

  return { 
    fieldOptions: data || [], 
    loading: isLoading, 
    error: error ? `Failed to load fields: ${error.message}` : null 
  };
};
