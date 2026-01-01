import { useState, useRef, useEffect } from 'react';
import VesselSelector from './VesselSelector';

function Header({ year, onYearChange, vessels, selectedVesselIds, onVesselChange }) {
  const years = [2023, 2024, 2025];
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const yearDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-one-magenta rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Procurement Dashboard</h1>
              <p className="text-sm text-gray-500">Fleet procurement analytics & tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <VesselSelector
              vessels={vessels}
              selectedIds={selectedVesselIds}
              onChange={onVesselChange}
            />

            {/* Custom Year Dropdown - drops DOWN like vessel selector */}
            <div className="relative" ref={yearDropdownRef}>
              <button
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-one-magenta min-w-[100px]"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{year}</span>
                <svg className={`w-4 h-4 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {yearDropdownOpen && (
                <div className="absolute right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[100px] overflow-hidden">
                  {years.map(y => (
                    <button
                      key={y}
                      onClick={() => {
                        onYearChange(y);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                        y === year ? 'bg-one-magenta/10 text-one-magenta font-medium' : 'text-gray-700'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
