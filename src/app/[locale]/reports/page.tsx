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

  // Extract unique descriptions from harvests
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

  return (
    <main className="min-h-screen p-8 bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl shadow-md overflow-hidden p-6 mb-6">
          <h1 className="text-2xl font-heading font-bold mb-6 text-[var(--text-secondary)]">Harvest Reports</h1>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-[var(--text-secondary)]">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="mt-1 block w-full rounded-lg border-[var(--text-muted)] shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-[var(--text-secondary)]">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="mt-1 block w-full rounded-lg border-[var(--text-muted)] shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)]">
                Description Filter
              </label>
              <select
                id="description"
                value={filters.description}
                onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border-[var(--text-muted)] shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] disabled:bg-[var(--bg-secondary)] disabled:text-[var(--text-muted)]"
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

          {/* Summary Card */}
          <div className="bg-[var(--bg-accent)] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-heading font-semibold text-[var(--text-secondary)] mb-2">Summary</h2>
            <div className="text-3xl font-bold text-[var(--primary-color)]">
              Total Amount: {totalAmount.toFixed(2)}
            </div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">
              Records found: {filteredHarvests.length}
            </div>
          </div>

          {/* Results Table */}
          <div className="mt-4 overflow-x-auto">
            {isLoadingHarvests ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading-pulse w-8 h-8 rounded-full"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-[var(--text-muted)]">
                <thead className="bg-[var(--bg-secondary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--bg-primary)] divide-y divide-[var(--text-muted)]">
                  {filteredHarvests.map((harvest) => (
                    <tr key={harvest._id} className="bg-hover">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {format(new Date(harvest.harvestDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {harvest.description.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                        {harvest.description.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {harvest.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        {harvest.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
  
}