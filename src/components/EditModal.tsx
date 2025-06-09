import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Harvest, EditFormData } from '@/types/harvests';

interface EditModalProps {
  harvest: Harvest;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: EditFormData) => Promise<void>;
}

const units = ['unidade', 'kg', 'gramas', 'maço'];

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-light p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit Harvest</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-text-secondary mb-1">
                Amount
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
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-text-secondary mb-1">
                Unit
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
            <label htmlFor="harvestDate" className="block text-sm font-medium text-text-secondary mb-1">
              Harvest Date
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

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-background-dark text-text-primary hover:bg-background-light"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}