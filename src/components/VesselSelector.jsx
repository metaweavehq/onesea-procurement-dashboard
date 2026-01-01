import { useState, useEffect, useRef } from 'react';

function VesselSelector({ vessels, selectedIds = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter vessels by search term
  const filteredVessels = vessels.filter(v =>
    v.NAME.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle a single vessel
  const toggleVessel = (shipId) => {
    const newIds = selectedIds.includes(shipId)
      ? selectedIds.filter(id => id !== shipId)
      : [...selectedIds, shipId];
    onChange(newIds);
  };

  // Select all visible vessels
  const selectAll = () => {
    const visibleIds = filteredVessels.map(v => v.SHIP_ID);
    const newIds = [...new Set([...selectedIds, ...visibleIds])];
    onChange(newIds);
  };

  // Clear all selections
  const clearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  // Get display text
  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return 'All Vessels (Fleet)';
    } else if (selectedIds.length === 1) {
      const vessel = vessels.find(v => v.SHIP_ID === selectedIds[0]);
      return vessel?.NAME || 'Selected Vessel';
    } else {
      return `${selectedIds.length} Vessels Selected`;
    }
  };

  // Get selected vessel names for tooltip
  const getSelectedNames = () => {
    return selectedIds
      .map(id => vessels.find(v => v.SHIP_ID === id)?.NAME)
      .filter(Boolean)
      .slice(0, 5)
      .join(', ') + (selectedIds.length > 5 ? '...' : '');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Display Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-one-magenta min-w-[200px]"
        title={selectedIds.length > 1 ? getSelectedNames() : undefined}
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="flex-1 text-left truncate">{getDisplayText()}</span>
        {selectedIds.length > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-one-magenta text-white rounded-full">
            {selectedIds.length}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-80 max-h-[400px] overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vessels..."
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-one-magenta focus:border-transparent"
                autoFocus
              />
              <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-3 py-2 border-b border-gray-200 flex gap-2 text-xs">
            <button
              onClick={selectAll}
              className="text-blue-600 hover:underline"
            >
              Select All {searchTerm && 'Visible'}
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={clearAll}
              className="text-red-600 hover:underline"
            >
              Clear All
            </button>
            {selectedIds.length > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{selectedIds.length} selected</span>
              </>
            )}
          </div>

          {/* Vessel List */}
          <div className="max-h-[280px] overflow-y-auto">
            {/* All Vessels Option */}
            <label
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedIds.length === 0 ? 'bg-one-magenta/5' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.length === 0}
                onChange={clearAll}
                className="rounded text-one-magenta focus:ring-one-magenta"
              />
              <span className="font-medium text-gray-700">All Vessels (Fleet)</span>
            </label>

            {/* Individual Vessels */}
            {filteredVessels.map(vessel => (
              <label
                key={vessel.SHIP_ID}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 ${
                  selectedIds.includes(vessel.SHIP_ID) ? 'bg-one-magenta/5' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(vessel.SHIP_ID)}
                  onChange={() => toggleVessel(vessel.SHIP_ID)}
                  className="rounded text-one-magenta focus:ring-one-magenta"
                />
                <span className="text-sm text-gray-700 truncate">{vessel.NAME}</span>
              </label>
            ))}

            {/* No Results */}
            {filteredVessels.length === 0 && (
              <div className="px-3 py-4 text-center text-gray-500 text-sm">
                No vessels found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Footer with count */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {filteredVessels.length} of {vessels.length} vessels
          </div>
        </div>
      )}
    </div>
  );
}

export default VesselSelector;
