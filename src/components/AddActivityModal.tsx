'use client';

import { useState } from 'react';
import { X, Leaf, Zap, Globe, Plane, ShoppingCart, Lightbulb } from 'lucide-react';

const activityTypes = [
  { name: 'Cloud Computing', icon: Globe },
  { name: 'Data Transfer', icon: Zap },
  { name: 'Air Travel', icon: Plane },
  { name: 'Online Shopping', icon: ShoppingCart },
  { name: 'Energy Usage', icon: Lightbulb },
];

export default function AddActivityModal({ isOpen, onClose, onActivityAdded }) {
  const [activityType, setActivityType] = useState(activityTypes[0].name);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!activityType || !amount || !description) {
      setError('Please fill out all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/carbon/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: activityType,
          amount: parseFloat(amount),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      onActivityAdded();
      onClose();
    } catch (err) {
      setError('Failed to add activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="relative bg-carbon-card border border-carbon-border rounded-xl w-full max-w-lg p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-carbon-muted hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Leaf size={24} className="text-primary-green" />
          <h2 className="text-2xl font-bold text-white">Log a New Activity</h2>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Activity Type Selector */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Activity Type</label>
            <div className="grid grid-cols-3 gap-2">
              {activityTypes.map(type => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => setActivityType(type.name)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 border rounded-lg transition-all duration-200 text-sm ${
                    activityType === type.name
                      ? 'border-primary-green bg-primary-green/10 text-primary-green'
                      : 'border-carbon-border text-carbon-muted hover:border-carbon-light hover:text-white'
                  }`}
                >
                  <type.icon size={20} />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-white mb-2">
              Amount (kg CO₂)
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-4 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              placeholder="e.g., 15.5"
              required
            />
             <p className="text-xs text-carbon-muted mt-2">
              Enter the estimated carbon amount. We'll add calculators for this later.
            </p>
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full px-4 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
              placeholder="e.g., Round trip flight from SFO to LAX"
              required
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 