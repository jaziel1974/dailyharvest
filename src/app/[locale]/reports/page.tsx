'use client';

import { useState } from 'react';
import { useHarvests } from '@/hooks/useHarvests';
import { format } from 'date-fns';

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    description: ''
  });

  const { data: harvests = [], isLoading: isLoadingHarvests } = useHarvests(
    filters.startDate || undefined,
    filters.endDate || undefined
  );

  const uniqueDescriptions = [...new Map(
    harvests.map(harvest => [
      harvest.description._id,
      harvest.description
    ])
  ).values()];

  const filteredHarvests = harvests.filter(harvest => 
    !filters.description || harvest.description._id === filters.description
  );

  const totalAmount = filteredHarvests.reduce((sum, harvest) => 
    sum + (harvest.amount || 0), 0
  );

  // Group harvests by date
  const harvestsByDate = filteredHarvests.reduce((acc, harvest) => {
    const date = format(new Date(harvest.harvestDate), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(harvest);
    return acc;
  }, {} as Record<string, typeof filteredHarvests>);

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-[var(--bg-primary)] safe-area-bottom">
      <div className="max-w-4xl mx-auto">
        {/* Filters Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Harvest Reports</h1>
          
          <div className="space-y-4">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Description Filter */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Filter by Description
              </label>
              <select
                id="description"
                value={filters.description}
                onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoadingHarvests}
              >
                <option value="">All descriptions</option>
                {uniqueDescriptions.map((desc) => (
                  <option key={desc._id} value={desc._id}>
                    {desc.description} ({desc.category.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Total Amount</h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <h3 className="text-sm font-medium text-[var(--text-secondary)]">Records</h3>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {filteredHarvests.length}
              </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {isLoadingHarvests ? (
            <div className="flex justify-center items-center py-8">
              <div className="loading-pulse w-8 h-8 rounded-full"></div>
            </div>
          ) : Object.entries(harvestsByDate).length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              No harvests found for the selected criteria
            </div>
          ) : (
            Object.entries(harvestsByDate).map(([date, dayHarvests]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-sm font-medium text-[var(--text-secondary)]">
                    {format(new Date(date), 'MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dayHarvests.map((harvest) => (
                    <div
                      key={harvest._id}
                      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-[var(--text-primary)]">
                            {harvest.description.description}
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {harvest.description.category.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-[var(--text-primary)]">
                            {harvest.amount}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {harvest.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}