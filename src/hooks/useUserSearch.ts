import { useState, useEffect } from 'react';
import { User, SearchResponse } from '@/types';

interface UseUserSearchProps {
  limit: number;
}

export function useUserSearch({ limit }: UseUserSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [queryTimeMs, setQueryTimeMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;

    async function fetchUsers() {
      setIsLoading(true);
      setError(null);
      
      const offset = (page - 1) * limit;
      const url = `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=${limit}&offset=${offset}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data: SearchResponse = await response.json();
        
        if (active) {
          setUsers(data.users);
          setTotal(data.total);
          setQueryTimeMs(data.queryTimeMs);
        }
      } catch (err) {
        if (active) {
          console.error(err);
          const message = err instanceof Error ? err.message : 'Something went wrong while fetching data.';
          setError(message);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      active = false;
    };
  }, [debouncedQuery, page, limit]);

  return {
    query,
    setQuery,
    debouncedQuery,
    users,
    total,
    queryTimeMs,
    isLoading,
    page,
    setPage,
    error,
  };
}
