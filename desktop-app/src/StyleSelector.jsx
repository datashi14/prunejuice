import React from 'react';

const STYLES = [
  { id: 'photographic', name: 'Photographic', emoji: '📸' },
  { id: 'product', name: 'Product', emoji: '🛍️' },
  { id: 'portrait', name: 'Portrait', emoji: '👤' },
  { id: 'anime', name: 'Anime', emoji: '🎌' },
  { id: 'oil', name: 'Oil Painting', emoji: '🎨' },
  { id: 'minimalist', name: 'Minimalist', emoji: '⬛' },
  { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌃' },
];

const StyleSelector = ({ selectedStyle, onSelect }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
            selectedStyle === style.id
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span className="text-xl">{style.emoji}</span>
          <span className="text-sm font-medium">{style.name}</span>
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;
