'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import {
  SearchBar,
  SearchResults,
  SearchSkeleton,
  useSearch,
  type SearchEntityType,
} from '@/features/search';

export function SearchPageClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [entity, setEntity] = useState<SearchEntityType | ''>(
    (params.get('entity') as SearchEntityType | null) ?? '',
  );
  const [page, setPage] = useState(Number(params.get('page') ?? '1'));

  const searchParams = {
    q: query,
    ...(entity ? { entity } : {}),
    page,
    pageSize: 20,
  } as const;

  const { data, isLoading, isError } = useSearch(searchParams);

  const handleSearch = useCallback(
    (q: string, ent: SearchEntityType | '') => {
      setQuery(q);
      setEntity(ent);
      setPage(1);

      const sp = new URLSearchParams();
      if (q) sp.set('q', q);
      if (ent) sp.set('entity', ent);
      router.replace(`/search?${sp.toString()}`);
    },
    [router],
  );

  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);
      const sp = new URLSearchParams();
      if (query) sp.set('q', query);
      if (entity) sp.set('entity', entity);
      sp.set('page', String(p));
      router.replace(`/search?${sp.toString()}`);
    },
    [router, query, entity],
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Search</h1>

      <SearchBar
        initialQuery={query}
        initialEntity={entity}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <div className="mt-6">
        {isError && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600" role="alert">
            Search is temporarily unavailable. Please try again.
          </p>
        )}

        {isLoading && <SearchSkeleton />}

        {!isLoading && !isError && data?.data && (
          <SearchResults data={data.data} query={query} onPageChange={handlePageChange} />
        )}

        {!isLoading && !isError && !data && query.trim().length > 0 && (
          <p className="text-sm text-gray-400">Enter at least one character to search.</p>
        )}
      </div>
    </div>
  );
}
