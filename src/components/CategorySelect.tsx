'use client';

import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface CategorySelectProps {
  value?: string;
  onChangeAction: (categoryId: string) => void;
  className?: string;
}

export function CategorySelect({ value, onChangeAction, className = '' }: CategorySelectProps) {
  const { data: categories, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddCategory = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newCategory.trim() || createCategory.isPending) return;

    try {
      const category = await createCategory.mutateAsync({
        name: newCategory.trim()
      });
      setNewCategory('');
      setIsAdding(false);
      onChangeAction(category._id);
      toast.success('Category created successfully');
    } catch (error) {
      toast.error('Failed to create category');
      console.error('Failed to create category:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsAdding(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
    }
  };

  if (isLoading) {
    return (
      <div className={`loading-pulse ${className}`} role="status">
        <div className="h-10 loading-highlight rounded-[var(--radius-md)] w-full" />
        <span className="sr-only">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} error-card`} role="alert">
        <span className="error-text">
          {error instanceof Error ? error.message : 'Failed to load categories'}
        </span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {!isAdding ? (
        <div className="flex gap-2">
          <select
            value={value || ''}
            onChange={(e) => onChangeAction(e.target.value)}
            className="flex-1 p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
            aria-label="Select category"
          >
            <option value="">Select a category</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="btn btn-primary"
            aria-label="Create new category"
          >
            Add New
          </button>
        </div>
      ) : (
        <div 
          className="flex gap-2"
          role="group"
          aria-label="Create new category form"
        >
          <input
            ref={inputRef}
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name"
            className="flex-1 p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
            disabled={createCategory.isPending}
            aria-label="New category name"
          />
          <button
            type="button"
            onClick={() => handleAddCategory()}
            disabled={createCategory.isPending}
            className="btn btn-primary"
            aria-label={createCategory.isPending ? "Creating category..." : "Save category"}
          >
            {createCategory.isPending ? (
              <span className="flex items-center" aria-hidden="true">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            ) : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="btn bg-background-dark text-text-primary hover:bg-background-light"
            disabled={createCategory.isPending}
            aria-label="Cancel creating category"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}