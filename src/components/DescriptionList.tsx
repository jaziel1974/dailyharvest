'use client';

import { useState, useRef, useEffect } from 'react';
import { useDescriptions, useCreateDescription, useUpdateDescription, useDeleteDescription } from '@/hooks/useDescriptions';
import { CategorySelect } from './CategorySelect';
import { toast } from 'react-hot-toast';
import { useDebounce } from '@/hooks/useDebounce';

type SortField = 'description' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

export function DescriptionList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: descriptions, isLoading, error } = useDescriptions(
    selectedCategory ? { categoryId: selectedCategory } : undefined
  );

  const filteredAndSortedDescriptions = descriptions
    ?.filter(desc => {
      const matchesSearch = desc.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus = filterStatus === 'all' || desc.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const order = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'description') {
        return a.description.localeCompare(b.description) * order;
      }
      return new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime() * order;
    });

  const createDescription = useCreateDescription();
  const updateDescription = useUpdateDescription();
  const deleteDescription = useDeleteDescription();

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingId) {
      editInputRef.current?.focus();
    }
  }, [editingId]);

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      startEdit(descriptions?.find(d => d._id === id)?.description || '', id);
    } else if (e.key === 'Delete' && e.metaKey) {
      e.preventDefault();
      handleDelete(id);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdate(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim() || !selectedCategory) return;

    try {
      await createDescription.mutateAsync({
        description: newDescription.trim(),
        categoryId: selectedCategory,
        userId: 'temp-user'
      });
      setNewDescription('');
      toast.success('Description added successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create description');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;

    try {
      await updateDescription.mutateAsync({
        id,
        updates: { description: editText.trim() }
      });
      setEditingId(null);
      setEditText('');
      toast.success('Description updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update description');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this description?')) return;

    try {
      await deleteDescription.mutateAsync(id);
      toast.success('Description deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete description');
    }
  };

  const startEdit = (description: string, id: string) => {
    setEditingId(id);
    setEditText(description);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading descriptions</h3>
            <div className="mt-2 text-sm text-red-700">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CategorySelect 
        value={selectedCategory}
        onChangeAction={setSelectedCategory}
        className="mb-4"
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search descriptions..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            aria-label="Search descriptions"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSort('description')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortField === 'description'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`Sort by description ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              Name {sortField === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('createdAt')}
              className={`px-3 py-1 text-sm rounded-md ${
                sortField === 'createdAt'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`Sort by creation date ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              Created {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Enter new description"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
          disabled={!selectedCategory || createDescription.isPending}
          aria-label="New description"
        />
        <button
          type="submit"
          disabled={!selectedCategory || createDescription.isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={createDescription.isPending ? "Adding description..." : "Add description"}
        >
          {createDescription.isPending ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </span>
          ) : 'Add'}
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-md" />
              <div className="mt-2 h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedDescriptions?.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No descriptions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategory
              ? searchTerm
                ? 'No matching descriptions found'
                : 'Start by adding a new description'
              : 'Select a category to add descriptions'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4" role="list">
          {filteredAndSortedDescriptions?.map((desc) => (
            <li
              key={desc._id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow group hover:shadow-md transition-shadow"
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, desc._id)}
              role="listitem"
            >
              {editingId === desc._id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, desc._id)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    aria-label="Edit description"
                  />
                  <button
                    onClick={() => handleUpdate(desc._id)}
                    disabled={updateDescription.isPending}
                    className="px-3 py-1 text-sm text-white bg-primary-500 rounded-md hover:bg-primary-600"
                    aria-label="Save changes"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <p className="text-gray-900">{desc.description}</p>
                    <p className="text-xs text-gray-500">
                      Created {new Date(desc.createdAt).toLocaleDateString()}
                      {desc.updatedAt !== desc.createdAt && 
                        ` • Updated ${new Date(desc.updatedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(desc.description, desc._id)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                      aria-label={`Edit description: ${desc.description}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(desc._id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                      aria-label={`Delete description: ${desc.description}`}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}