import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Harvest, EditFormData } from '@/types/harvests';

interface EditModalProps {
  harvest: Harvest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: EditFormData) => Promise<void>;
}

const units = ['piece', 'kg', 'g', 'lb', 'oz', 'bunch'];

export function EditModal({ harvest, isOpen, onClose, onSave }: EditModalProps) {
  const [amount, setAmount] = useState(harvest.amount.toString());
  const [unit, setUnit] = useState(harvest.unit);
  const [harvestDate, setHarvestDate] = useState(
    format(new Date(harvest.harvestDate), 'yyyy-MM-dd')
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setAmount(harvest.amount.toString());
    setUnit(harvest.unit);
    setHarvestDate(format(new Date(harvest.harvestDate), 'yyyy-MM-dd'));
  }, [harvest]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount.trim()) return;

    try {
      setIsSaving(true);
      await onSave({
        amount: Number(amount),
        unit,
        harvestDate,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update harvest:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 py-6 overflow-y-auto">
      <div 
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="relative">
          {/* Mobile drag indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden" />
          
          <div className="px-6 pt-6 pb-4">
            <h2 
              id="modal-title"
              className="text-xl font-bold mb-4 text-gray-900 dark:text-white"
            >
              Edit Harvest
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor="amount" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Amount
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
                    className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="unit" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Unit
                  </label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label 
                    htmlFor="harvestDate" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    id="harvestDate"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    required
                    className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-4 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}