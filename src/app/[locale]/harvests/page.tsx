"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  useHarvests,
  useUpdateHarvest,
  useDeleteHarvest,
  useCreateHarvest,
} from "@/hooks/useHarvests";
import { useDescriptions, useCreateDescription } from "@/hooks/useDescriptions";
import { CategorySelect } from '@/components/CategorySelect';
import { EditModal } from '@/components/EditModal';
import { Harvest, EditFormData, Description, CreateDescriptionInput } from '@/types/harvests';
import { useTranslations } from 'next-intl';

const units = ['piece', 'kg', 'g', 'lb', 'oz', 'bunch'];

export default function HarvestsPage() {
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const { data: harvests, isLoading } = useHarvests();
  const updateHarvest = useUpdateHarvest();
  const deleteHarvest = useDeleteHarvest();
  const createHarvestMutation = useCreateHarvest();
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDescription, setSelectedDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState<string>("piece");
  const [harvestDate, setHarvestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  const { data: descriptions = [], isLoading: isLoadingDescriptions } = useDescriptions({
    categoryId: selectedCategory || undefined
  });
  const createDescriptionMutation = useCreateDescription();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEdit = (harvest: Harvest) => {
    setEditingHarvest(harvest);
  };

  const handleSave = async (formData: EditFormData) => {
    await updateHarvest.mutateAsync({
      id: editingHarvest!._id,
      ...formData,
    });
    setEditingHarvest(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('common.confirmDelete'))) {
      try {
        await deleteHarvest.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete harvest:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDescription || !amount.trim()) return;

    try {
      await createHarvestMutation.mutateAsync({
        descriptionId: selectedDescription,
        amount: Number(amount),
        unit,
        harvestDate,
      });
      // Reset form
      setAmount('');
      setUnit('piece');
      setSelectedDescription('');
      setHarvestDate(format(new Date(), 'yyyy-MM-dd'));
    } catch (error) {
      console.error('Failed to create harvest:', error);
    }
  };

  const handleCreateDescription = async () => {
    if (!selectedCategory || !newDescription.trim()) return;

    try {
      const input: CreateDescriptionInput = {
        description: newDescription.trim(),
        categoryId: selectedCategory,
        userId: 'temp-user'
      };
      
      const result = await createDescriptionMutation.mutateAsync(input);
      setSelectedDescription(result._id);
      setNewDescription('');
      setIsAddingDescription(false);
    } catch (error) {
      console.error('Failed to create description:', error);
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4 max-w-lg mx-auto"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                {t('harvests.category')}
              </label>
              <CategorySelect
                value={selectedCategory}
                onChangeAction={(value) => {
                  setSelectedCategory(value);
                  setSelectedDescription("");
                }}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                {t('harvests.description')}
              </label>
              {!isAddingDescription ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    id="description"
                    value={selectedDescription}
                    onChange={(e) => setSelectedDescription(e.target.value)}
                    required
                    className="flex-1 p-3 border rounded-lg text-base focus:ring-[var(--primary-color)]"
                    disabled={!selectedCategory || isLoadingDescriptions}
                  >
                    <option value="">
                      {isLoadingDescriptions
                        ? t('harvests.loadingDescriptions')
                        : t('harvests.selectDescription')}
                    </option>
                    {descriptions?.map((desc: Description) => (
                      <option key={desc._id} value={desc._id}>
                        {desc.description}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingDescription(true)}
                    className="btn btn-primary w-full sm:w-auto py-3"
                    disabled={!selectedCategory || isLoadingDescriptions}
                  >
                    {t('harvests.addNew')}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder={t('harvests.enterNewDescription')}
                    className="flex-1 p-3 border rounded-lg text-base focus:ring-[var(--primary-color)]"
                    disabled={createDescriptionMutation.isPending}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateDescription}
                      disabled={
                        createDescriptionMutation.isPending ||
                        !newDescription.trim()
                      }
                      className="btn btn-primary flex-1 py-3"
                    >
                      {createDescriptionMutation.isPending ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          {t('harvests.adding')}
                        </span>
                      ) : (
                        t('common.save')
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingDescription(false)}
                      className="btn bg-background-dark text-text-primary hover:bg-background-light flex-1 py-3"
                      disabled={createDescriptionMutation.isPending}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  {t('harvests.amount')}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="any"
                  className="w-full p-3 border rounded-lg text-base focus:ring-[var(--primary-color)]"
                  placeholder={t('harvests.enterAmount')}
                />
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium text-text-secondary mb-2"
                >
                  {t('harvests.unit')}
                </label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-3 border rounded-lg text-base focus:ring-[var(--primary-color)]"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="harvestDate"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                {t('harvests.harvestDate')}
              </label>
              <input
                type="date"
                id="harvestDate"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
                className="w-full p-3 border rounded-lg text-base focus:ring-[var(--primary-color)]"
              />
            </div>

            <button
              type="submit"
              disabled={createHarvestMutation.isPending || !selectedDescription}
              className="btn btn-primary w-full py-3 text-base font-medium"
            >
              {createHarvestMutation.isPending ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h1 className="text-2xl font-bold mb-6 text-text-secondary">{t('harvests.title')}</h1>

        {harvests?.length === 0 ? (
          <p className="text-text-secondary text-center py-8">{t('harvests.noHarvestsFound')}</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                {/* Large screens table */}
                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.harvestDate')}</th>
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.category')}</th>
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.description')}</th>
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.amount')}</th>
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.unit')}</th>
                      <th className="py-3 px-4 text-left text-text-secondary">{t('harvests.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {harvests?.map((harvest) => (
                      <tr
                        key={harvest._id}
                        className="border-t hover:bg-background-dark transition-all duration-200"
                      >
                        <td className="py-3 px-4 text-text-secondary">
                          {format(new Date(harvest.harvestDate), "MMM d, yyyy")}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {harvest.description.category.name}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {harvest.description.description}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {harvest.amount}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          {harvest.unit}
                        </td>
                        <td className="py-3 px-4 text-text-secondary">
                          <button
                            onClick={() => handleEdit(harvest)}
                            className="text-blue-500 hover:text-blue-700 mr-3"
                          >
                            {t('common.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(harvest._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            {t('common.delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-4">
                  {harvests?.map((harvest) => (
                    <div
                      key={harvest._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">
                            {format(new Date(harvest.harvestDate), "MMM d, yyyy")}
                          </p>
                          <p className="font-medium">{harvest.description.description}</p>
                          <p className="text-sm text-gray-600">{harvest.description.category.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{harvest.amount} {harvest.unit}</p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-2 border-t">
                        <button
                          onClick={() => handleEdit(harvest)}
                          className="text-blue-500 hover:text-blue-700 px-3 py-1"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(harvest._id)}
                          className="text-red-500 hover:text-red-700 px-3 py-1"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {editingHarvest && (
        <EditModal
          harvest={editingHarvest}
          isOpen={!!editingHarvest}
          onClose={() => setEditingHarvest(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
