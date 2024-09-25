import { useState, useCallback, useMemo } from 'react';

import { ISafeAny } from '@/type';

import { useRequest } from './use-request';

interface IUseRequestListOptions<T> {
  perPage?: number;
  params?: ISafeAny;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  ready?: boolean;
  deps?: ISafeAny[];
  cancelOnUnmount?: boolean;
}

interface IUseRequestList<T> {
  loading: boolean;
  data: T | undefined;
  refresh: () => void;
  cancelRequest: () => void;
  changePage: (page: number) => void;
  currentPage: number;
  perPage: number;
  getNextPage: () => void;
}

export const useRequestList = <T>(request: (params?: ISafeAny) => Promise<T>, options?: IUseRequestListOptions<T>): IUseRequestList<T> => {
  const { perPage = 10, params, ...restOptions } = options ?? {};
  const [page, setPage] = useState(1);
  const memoizedParams = useMemo(() => ({ perPage, page, ...params }), [perPage, page, params]);

  const result = useRequest<T>(request, {
    ...restOptions,
    params: memoizedParams,
    deps: [page, perPage, ...(restOptions.deps ?? [])],
  });

  const changePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const getNextPage = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, [page]);

  return {
    ...result,
    changePage,
    currentPage: page,
    perPage,
    getNextPage,
  };
};