import { SearchX } from 'lucide-react';

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <SearchX className="text-gray-300" size={48} aria-hidden="true" />
      <p className="text-base font-medium text-gray-600">
        No results for <span className="font-semibold text-gray-800">&ldquo;{query}&rdquo;</span>
      </p>
      <p className="text-sm text-gray-400">
        Try adjusting your search or switching the entity filter.
      </p>
    </div>
  );
}
