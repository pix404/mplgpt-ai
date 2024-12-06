"use client";

import { useState } from 'react';
import { TraitConfig } from '@/types/nft-metadata';

interface TraitConfiguratorProps {
  onTraitsUpdate: (traits: TraitConfig[]) => void;
}

export function TraitConfigurator({ onTraitsUpdate }: TraitConfiguratorProps) {
  const [traits, setTraits] = useState<TraitConfig[]>([]);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitValues, setNewTraitValues] = useState('');
  const [useWeights, setUseWeights] = useState(false);
  const [newTraitWeights, setNewTraitWeights] = useState('');

  const addTrait = () => {
    if (!newTraitName || !newTraitValues) return;

    const values = newTraitValues.split(',').map(v => v.trim());
    let weights: number[] | undefined;

    if (useWeights) {
      weights = newTraitWeights
        .split(',')
        .map(w => parseFloat(w.trim()))
        .filter(w => !isNaN(w));

      if (weights.length !== values.length) {
        alert('Number of weights must match number of values');
        return;
      }
    }

    const newTrait: TraitConfig = {
      name: newTraitName,
      values,
      weights
    };

    const updatedTraits = [...traits, newTrait];
    setTraits(updatedTraits);
    onTraitsUpdate(updatedTraits);

    // Reset inputs
    setNewTraitName('');
    setNewTraitValues('');
    setNewTraitWeights('');
  };

  const removeTrait = (index: number) => {
    const updatedTraits = traits.filter((_, i) => i !== index);
    setTraits(updatedTraits);
    onTraitsUpdate(updatedTraits);
  };

  return (
    <div className="space-y-6">
      <div className="vs-container p-4">
        <h3 className="text-lg font-semibold mb-4">Add New Trait</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Trait Name</label>
            <input
              type="text"
              value={newTraitName}
              onChange={(e) => setNewTraitName(e.target.value)}
              className="vs-input w-full"
              placeholder="e.g., Background, Eyes, Hair"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Values (comma-separated)</label>
            <input
              type="text"
              value={newTraitValues}
              onChange={(e) => setNewTraitValues(e.target.value)}
              className="vs-input w-full"
              placeholder="e.g., Red, Blue, Green"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={useWeights}
              onChange={(e) => setUseWeights(e.target.checked)}
              className="vs-checkbox"
            />
            <label className="text-sm">Use custom weights</label>
          </div>

          {useWeights && (
            <div>
              <label className="block text-sm mb-2">Weights (comma-separated)</label>
              <input
                type="text"
                value={newTraitWeights}
                onChange={(e) => setNewTraitWeights(e.target.value)}
                className="vs-input w-full"
                placeholder="e.g., 0.5, 0.3, 0.2"
              />
            </div>
          )}

          <button
            onClick={addTrait}
            className="vs-button"
            disabled={!newTraitName || !newTraitValues}
          >
            Add Trait
          </button>
        </div>
      </div>

      {traits.length > 0 && (
        <div className="vs-container p-4">
          <h3 className="text-lg font-semibold mb-4">Configured Traits</h3>
          <div className="space-y-4">
            {traits.map((trait, index) => (
              <div key={index} className="flex items-start justify-between p-4 border border-white/10 rounded-lg">
                <div>
                  <h4 className="font-medium">{trait.name}</h4>
                  <p className="text-sm text-gray-400">
                    Values: {trait.values.join(', ')}
                  </p>
                  {trait.weights && (
                    <p className="text-sm text-gray-400">
                      Weights: {trait.weights.join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeTrait(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
