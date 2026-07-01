'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { SearchEntityType } from '../types/search.types';

const DEBOUNCE_MS = 300;

const ENTITY_OPTIONS: { label: string; value: SearchEntityType | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Applicants', value: 'applicant' },
  { label: 'Documents', value: 'document' },
  { label: 'Workflow', value: 'workflow' },
];

interface SearchBarProps {
  initialQuery?: string;
  initialEntity?: SearchEntityType | '';
  onSearch: (query: string, entity: SearchEntityType | '') => void;
  isLoading?: boolean;
}

export function SearchBar({
  initialQuery = '',
  initialEntity = '',
  onSearch,
  isLoading,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [entity, setEntity] = useState<SearchEntityType | ''>(initialEntity);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fireSearch = useCallback(
    (query: string, ent: SearchEntityType | '') => {
      onSearch(query, ent);
    },
    [onSearch],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fireSearch(inputValue, entity);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, entity, fireSearch]);

  function handleClear() {
    setInputValue('');
    fireSearch('', entity);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
          aria-hidden="true"
        />
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search applicants, documents, workflow…"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          aria-label="Global search"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <select
        value={entity}
        onChange={(e) => setEntity(e.target.value as SearchEntityType | '')}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        aria-label="Filter by entity type"
      >
        {ENTITY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {isLoading && (
        <span className="text-xs text-gray-400" aria-live="polite">
          Searching…
        </span>
      )}
    </div>
  );
}
