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
      <div>
        {/* Harvest Form */}
        <form
          onSubmit={handleSubmit}
          className="section mb-8 space-y-4 max-w-lg"
        >
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-text-secondary mb-1"
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
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              {t('harvests.description')}
            </label>
            {!isAddingDescription ? (
              <div className="flex gap-2">
                <select
                  id="description"
                  value={selectedDescription}
                  onChange={(e) => setSelectedDescription(e.target.value)}
                  required
                  className="flex-1 p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
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
                  className="btn btn-primary"
                  disabled={!selectedCategory || isLoadingDescriptions}
                >
                  {t('harvests.addNew')}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('harvests.enterNewDescription')}
                  className="flex-1 p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
                  disabled={createDescriptionMutation.isPending}
                />
                <button
                  type="button"
                  onClick={handleCreateDescription}
                  disabled={
                    createDescriptionMutation.isPending ||
                    !newDescription.trim()
                  }
                  className="btn btn-primary"
                >
                  {createDescriptionMutation.isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  className="btn bg-background-dark text-text-primary hover:bg-background-light"
                  disabled={createDescriptionMutation.isPending}
                >
                  {t('common.cancel')}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('harvests.amount')}
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="any"
                className="w-full p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
                placeholder={t('harvests.enterAmount')}
              />
            </div>

            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                {t('harvests.unit')}
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
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
              className="block text-sm font-medium text-text-secondary mb-1"
            >
              {t('harvests.harvestDate')}
            </label>
            <input
              type="date"
              id="harvestDate"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              required
              className="w-full p-2 border rounded-[var(--radius-md)] focus:ring-[var(--primary-color)]"
            />
          </div>

          <button
            type="submit"
            disabled={createHarvestMutation.isPending || !selectedDescription}
            className="btn btn-primary w-full"
          >
            {createHarvestMutation.isPending ? t('common.saving') : t('common.save')}
          </button>
        </form>
      </div>

      <div className="bg-background-light rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6 text-text-secondary">{t('harvests.title')}</h1>

        {harvests?.length === 0 ? (
          <p className="text-text-secondary">{t('harvests.noHarvestsFound')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
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
                    <td className="py-2 px-4 text-text-secondary">
                      {format(new Date(harvest.harvestDate), "MMM d, yyyy")}
                    </td>
                    <td className="py-2 px-4 text-text-secondary">
                      {harvest.description.category.name}
                    </td>
                    <td className="py-2 px-4 text-text-secondary">
                      {harvest.description.description}
                    </td>
                    <td className="py-2 px-4 text-text-secondary">
                      {harvest.amount}
                    </td>
                    <td className="py-2 px-4 text-text-secondary">
                      {harvest.unit}
                    </td>
                    <td className="py-2 px-4 text-text-secondary">
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
