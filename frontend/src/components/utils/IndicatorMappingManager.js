import React, { useState, useEffect } from 'react';
import '../../styles/IndicatorMappingManager.css';

const IndicatorMappingsManager = ({
  mappings,
  onAddMapping,
  onAddVariant,
  onDeleteMapping,
  onDeleteVariant
}) => {
  const [newIndicator, setNewIndicator] = useState('');

  const handleAddIndicator = (e) => {
    e.preventDefault();
    const trimmedIndicator = newIndicator.trim();
    if (trimmedIndicator && !Object.keys(mappings).includes(trimmedIndicator)) {
      onAddMapping(trimmedIndicator);
      setNewIndicator('');
    }
  };

  const handleDeleteIndicator = (indicatorName) => {
    onDeleteMapping(indicatorName);
  };

  return (
    <div className="indicator-manager">
      <h3 className="title">Настройка соответствия показателей</h3>

      <form onSubmit={handleAddIndicator} className="add-indicator-form">
        <div className="input-group">
          <input
            type="text"
            className="input-field"
            value={newIndicator}
            onChange={(e) => setNewIndicator(e.target.value)}
            placeholder="Название нового показателя"
          />
          <button type="submit" className="btn add-btn">
            Добавить показатель
          </button>
        </div>
      </form>

      <div className="mappings-container">
        {Object.entries(mappings || {}).map(([indicatorName, variants]) => (
          <div key={indicatorName} className="mapping-item">
            <div className="indicator-header">
              <h4 className="indicator-name">{indicatorName}</h4>
              <button
                className="btn delete-btn"
                onClick={() => handleDeleteIndicator(indicatorName)}
              >
                Удалить показатель
              </button>
            </div>

            <div className="variants-list">
              {Array.isArray(variants) &&
                variants.map((variant, index) => (
                  <div key={index} className="variant-item">
                    <span className="variant-name">{variant}</span>
                    <button
                      className="btn delete-btn"
                      onClick={() => onDeleteVariant(indicatorName, variant)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorMappingsManager;