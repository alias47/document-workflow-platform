'use client';

import { FileText, GitBranch, User } from 'lucide-react';

import { SearchEmptyState } from './SearchEmptyState';

import type {
  ApplicantSearchResult,
  DocumentSearchResult,
  SearchData,
  WorkflowSearchResult,
} from '../types/search.types';

interface SearchResultsProps {
  data: SearchData;
  query: string;
  onPageChange: (page: number) => void;
}

function ApplicantCard({ result }: { result: ApplicantSearchResult }) {
  return (
    <li className="flex items-start gap-3 py-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
        <User size={16} className="text-blue-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {result.firstName} {result.middleName ? `${result.middleName} ` : ''}
          {result.lastName}
        </p>
        <p className="text-xs text-gray-500">
          {result.applicantNumber}
          {result.email ? ` · ${result.email}` : ''}
        </p>
        <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">
          {result.status}
        </span>
      </div>
    </li>
  );
}

function DocumentCard({ result }: { result: DocumentSearchResult }) {
  return (
    <li className="flex items-start gap-3 py-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-50">
        <FileText size={16} className="text-green-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {result.title ?? result.originalFilename}
        </p>
        {result.description && (
          <p className="text-xs text-gray-500 line-clamp-1">{result.description}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1">
          {result.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

function WorkflowCard({ result }: { result: WorkflowSearchResult }) {
  return (
    <li className="flex items-start gap-3 py-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-50">
        <GitBranch size={16} className="text-purple-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">
          {result.firstName} {result.lastName}
        </p>
        <p className="text-xs text-gray-500">
          {result.applicantNumber} · Stage: {result.currentStageName}
        </p>
      </div>
    </li>
  );
}

export function SearchResults({ data, query, onPageChange }: SearchResultsProps) {
  if (data.results.length === 0) {
    return <SearchEmptyState query={query} />;
  }

  return (
    <div>
      <p className="mb-2 text-xs text-gray-400">
        {data.total} result{data.total !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
      </p>

      <ul className="divide-y divide-gray-100">
        {data.results.map((result) => {
          if (result.type === 'applicant') {
            return <ApplicantCard key={`applicant-${result.id}`} result={result} />;
          }
          if (result.type === 'document') {
            return <DocumentCard key={`document-${result.id}`} result={result} />;
          }
          return <WorkflowCard key={`workflow-${result.id}`} result={result} />;
        })}
      </ul>

      {data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => onPageChange(data.page - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            type="button"
            disabled={data.page >= data.totalPages}
            onClick={() => onPageChange(data.page + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
