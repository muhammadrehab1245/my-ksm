import type { Country, Plans } from '@/types';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import queryString from 'query-string';
import { http } from '@/utilities';

//prettier-ignore
export const fetcher = (url: string) => http(url).then((res) => res.data).catch(({ response }) => response.data);
const onErrorRetry = (error: { status: number }, key: string, { retryCount }: any) => {
  if (error.status === 404) return; // Never retry on 404.
  if (key === '/api/user') return; // Never retry for a specific key.
  if (retryCount >= 5) return; // Only retry up to 5 times.
};

function useKey(path: string, params?: any) {
  const { query } = useRouter();
  let finalQuery = { ...query, ...params };
  if (query?.page) {
    finalQuery = { ...finalQuery, page: Number(query?.page) - 1 };
  }

  return finalQuery ? `${path}?${queryString.stringify(finalQuery)}` : `${path}`;
}

export function useCountries() {
  const key = useKey('/address/public/countries');

  const { data, error } = useSWR<Country[]>(key, fetcher, { onErrorRetry });

  return {
    countries: data?.map(({ code, nameJa }) => ({ value: code, label: nameJa })),
    isLoading: !error && !data,
    isError: error,
  };
}

export function usePlans(params = { sortBy: 'code', sortDir: 'asc' }) {
  const key = useKey('/organizations/public/plans', params);

  const { data, error } = useSWR<Plans>(key, fetcher, { onErrorRetry });

  return {
    data: data?.content || [],
    page: data && data?.pageable?.pageNumber + 1,
    totalPages: data?.totalPages,
    isLoading: !error && !data,
    isError: error,
  };
}
