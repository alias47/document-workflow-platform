export function SearchSkeleton() {
  return (
    <ul className="divide-y divide-gray-100" aria-busy="true" aria-label="Loading search results">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex animate-pulse items-start gap-3 py-4">
          <div className="mt-0.5 h-8 w-8 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 rounded bg-gray-200" />
            <div className="h-3 w-3/5 rounded bg-gray-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}
