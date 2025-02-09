import React, { useState } from 'react';

const IndicatorMappingsManager = ({
  mappings,
  onAddMapping,
  onAddVariant,
  onDeleteMapping,
  onDeleteVariant
}) => {
  const [newIndicator, setNewIndicator] = useState('');
  const [newVariants, setNewVariants] = useState({});

  const handleAddIndicator = (e) => {
    e.preventDefault();
    if (newIndicator.trim()) {
      onAddMapping(newIndicator.trim());
      setNewIndicator('');
    }
  };

  const handleAddVariant = (indicatorName) => {
    const variant = newVariants[indicatorName]?.trim();
    if (variant) {
      onAddVariant(indicatorName, variant);
      setNewVariants(prev => ({
        ...prev,
        [indicatorName]: ''
      }));
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Настройка соответствия показателей</h3>
      
      {/* Add new indicator form */}
      <form onSubmit={handleAddIndicator} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newIndicator}
            onChange={(e) => setNewIndicator(e.target.value)}
            placeholder="Название нового показателя"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Добавить показатель
          </button>
        </div>
      </form>

      {/* List of existing indicators and their variants */}
      <div className="space-y-4">
        {Object.entries(mappings || {}).map(([indicatorName, variants]) => (
          <div key={indicatorName} className="border p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{indicatorName}</h4>
              <button
                onClick={() => onDeleteMapping(indicatorName)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Удалить показатель
              </button>
            </div>

            {/* Variants list */}
            <div className="ml-4">
              {Array.isArray(variants) && variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <span>{variant}</span>
                  <button
                    onClick={() => onDeleteVariant(indicatorName, variant)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add variant form */}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newVariants[indicatorName] || ''}
                onChange={(e) => setNewVariants(prev => ({
                  ...prev,
                  [indicatorName]: e.target.value
                }))}
                placeholder="Добавить вариант написания"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => handleAddVariant(indicatorName)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Добавить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorMappingsManager;