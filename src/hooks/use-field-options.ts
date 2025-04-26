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
        const response = await axiosInstance.get('/fields/');
        setFieldOptions(response.data?.data); // Assumes the API returns an array like the one you provided
      } catch (err) {
        console.error('Failed to fetch fields:', err);
        setError('Failed to load fields.');
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return { fieldOptions, loading, error };
};
