'use client';

import { Card, Button, InputGroup, Alert } from '@heroui/react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { UserCard } from '@/components/UserCard';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import { PaginationControl } from '@/components/PaginationControl';
import { SearchStats } from '@/components/SearchStats';

export default function Home() {
  const limit = 12;
  const {
    query,
    setQuery,
    users,
    total,
    queryTimeMs,
    isLoading,
    page,
    setPage,
    error,
  } = useUserSearch({ limit });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24">
        
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
            User Search Directory
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Search across 10,500+ registered profiles. Powered by Prisma and optimized with PostgreSQL GIN indexes.
          </p>
        </div>

        <Card className="border border-zinc-800 bg-zinc-950/40 p-5 rounded-xl space-y-4 mb-8">
          <InputGroup className="w-full bg-zinc-900 border border-zinc-800 focus-within:border-zinc-500 rounded-lg h-11 flex items-center px-3 gap-2">
            <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <InputGroup.Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent border-none text-zinc-100 placeholder-zinc-600 focus:outline-none text-sm w-full h-full"
              placeholder="Search by name..."
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              >
                Clear
              </button>
            )}
          </InputGroup>

          <SearchStats total={total} queryTimeMs={queryTimeMs} />
        </Card>

        {error && (
          <Alert className="border border-red-900/50 bg-red-950/20 text-red-200 rounded-xl p-4 mb-8">
            <Alert.Content>
              <Alert.Title className="font-semibold text-red-400">Database Connection Failed</Alert.Title>
              <Alert.Description className="mt-1 text-red-400/90 leading-relaxed block">
                {error}. Please check your configuration.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        {isLoading ? (
          <SkeletonGrid limit={limit} />
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <Card className="max-w-xl mx-auto border border-dashed border-zinc-800 bg-zinc-950/20 p-16 text-center space-y-3 rounded-xl shadow-none">
            <h3 className="text-sm font-semibold text-zinc-200">No users found</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-normal">
              We couldn&apos;t find any user profile matching your query.
            </p>
            {query && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuery('')}
                  className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100"
                >
                  Clear Search Filter
                </Button>
              </div>
            )}
          </Card>
        )}

        <PaginationControl page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
