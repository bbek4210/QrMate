import axiosInstance from '@/lib/axios';
import { useState, useEffect } from 'react';

export interface FieldOption {
  id: number;
  name: string;
}

export const useFieldOptions = () => {
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        console.log('Fetching fields from backend...');
        const response = await axiosInstance.get('/api/v1/fields/');
        console.log('Fields response:', response.data);
        setFieldOptions(response.data || []); // API returns array directly
      } catch (err) {
        console.error('Failed to fetch fields:', err);
        setError('Failed to load fields.');
        // Set some default fields if API fails
        setFieldOptions([
          { id: 1, name: 'Blockchain' },
          { id: 2, name: 'Web3' },
          { id: 3, name: 'DeFi' },
          { id: 4, name: 'NFT' },
          { id: 5, name: 'Gaming' },
          { id: 6, name: 'AI/ML' },
          { id: 7, name: 'Startup' },
          { id: 8, name: 'Investment' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return { fieldOptions, loading, error };
};
