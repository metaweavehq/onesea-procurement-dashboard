import { useState, useMemo, useEffect } from 'react';
import Pagination from './Pagination';

/**
 * FilterableTable - Reusable table component with Excel-style filtering and pagination
 *
 * Features:
 * - Dropdown filters for categorical columns (status, priority)
 * - Search box for text filtering
 * - Sortable columns (click header)
 * - Clear all filters button
 * - Pagination with page size options (25, 50, 75, 100)
 *
 * @param {Array} columns - Column definitions [{key, label, type: 'text'|'status'|'priority'|'number'|'date', render?}]
 * @param {Array} data - Row data
 * @param {string} searchPlaceholder - Placeholder for search box
 * @param {number} totalRecords - Total records (for server-side pagination)
 * @param {boolean} serverSide - Whether using server-side pagination
 * @param {function} onPageChange - Callback for page changes (for server-side)
 * @param {function} onPageSizeChange - Callback for page size changes (for server-side)
 */
function FilterableTable({
  columns,
  data,
  searchPlaceholder = 'Search...',
  totalRecords: propTotalRecords,
  serverSide = false,
  onPageChange: serverPageChange,
  onPageSizeChange: serverPageSizeChange,
  initialPageSize = 50
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({}); // { columnKey: Set of selected values }
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, data.length]);

  // Store original data unique values (computed once from initial data)
  // This ensures filter options remain available even after filtering
  const [originalUniqueValues, setOriginalUniqueValues] = useState({});

  // Update original unique values when data changes significantly
  useEffect(() => {
    const values = {};
    columns.forEach(col => {
      if (col.type === 'status' || col.type === 'priority' || col.filterable) {
        const unique = [...new Set(data.map(row => row[col.key]).filter(Boolean))];
        values[col.key] = unique.sort();
      }
    });
    // Only update if we have more values than before (data expanded) or first load
    const shouldUpdate = Object.keys(originalUniqueValues).length === 0 ||
      Object.keys(values).some(key =>
        (values[key]?.length || 0) > (originalUniqueValues[key]?.length || 0)
      );
    if (shouldUpdate) {
      setOriginalUniqueValues(values);
    }
  }, [columns, data]);

  // Get unique values - use original data values to ensure all options remain available
  // This ensures filter dropdowns show all values from the database, not just currently visible rows
  const uniqueValues = useMemo(() => {
    const result = {};
    columns.forEach(col => {
      if (col.type === 'status' || col.type === 'priority' || col.filterable) {
        // Use original values (captured when data first loaded) merged with current data values
        // This ensures all database values are always available in the dropdown
        const dataValues = [...new Set(data.map(row => row[col.key]).filter(Boolean))];
        const original = originalUniqueValues[col.key] || [];
        result[col.key] = [...new Set([...original, ...dataValues])].sort();
      }
    });
    return result;
  }, [columns, data, originalUniqueValues]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const value = row[col.key];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, selectedValues]) => {
      if (selectedValues.size > 0) {
        result = result.filter(row => selectedValues.has(row[key]));
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, filters, sortConfig, columns]);

  // Paginated data (client-side pagination)
  const paginatedData = useMemo(() => {
    if (serverSide) return filteredData; // Server handles pagination
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, serverSide]);

  const totalRecords = serverSide ? (propTotalRecords || data.length) : filteredData.length;

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (serverSide && serverPageChange) {
      serverPageChange(page, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (serverSide && serverPageSizeChange) {
      serverPageSizeChange(1, newSize);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter toggle
  const toggleFilter = (columnKey, value) => {
    setFilters(prev => {
      const current = prev[columnKey] || new Set();
      const newSet = new Set(current);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return { ...prev, [columnKey]: newSet };
    });
  };

  // Select/deselect all for a column
  const selectAllFilter = (columnKey) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: new Set(uniqueValues[columnKey])
    }));
  };

  const clearColumnFilter = (columnKey) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: new Set()
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({});
    setSortConfig({ key: null, direction: 'asc' });
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || Object.values(filters).some(f => f.size > 0);

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Render filter dropdown
  const renderFilterDropdown = (col) => {
    if (!uniqueValues[col.key]) return null;

    const selectedCount = filters[col.key]?.size || 0;
    const isOpen = openDropdown === col.key;

    return (
      <div className="relative inline-block ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown(isOpen ? null : col.key);
          }}
          className={`text-xs px-1 rounded ${selectedCount > 0 ? 'bg-one-magenta text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
        >
          {selectedCount > 0 ? `${selectedCount}` : '▼'}
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg min-w-[180px] max-h-[300px] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-gray-200 flex gap-2">
              <button
                onClick={() => selectAllFilter(col.key)}
                className="text-xs text-blue-600 hover:underline"
              >
                Select All
              </button>
              <button
                onClick={() => clearColumnFilter(col.key)}
                className="text-xs text-red-600 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="p-2">
              {uniqueValues[col.key].map(value => (
                <label key={value} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={filters[col.key]?.has(value) || false}
                    onChange={() => toggleFilter(col.key, value)}
                    className="rounded text-one-magenta focus:ring-one-magenta"
                  />
                  <span className="text-sm truncate">{value}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      'CREATED': 'bg-gray-100 text-gray-700',
      'AUTHORIZED': 'bg-blue-100 text-blue-700',
      'REVIEWED': 'bg-green-100 text-green-700',
      'APPROVED': 'bg-green-100 text-green-700',
      'ISSUED': 'bg-yellow-100 text-yellow-700',
      'EVALUATED': 'bg-purple-100 text-purple-700',
      'CANCELLED': 'bg-red-100 text-red-700',
      'DELIVERED': 'bg-green-100 text-green-700',
      'CLOSED': 'bg-gray-100 text-gray-700',
      'COMPLETION RECORDED': 'bg-green-100 text-green-700',
    };
    const colorClass = colors[status?.toUpperCase()] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status || 'N/A'}
      </span>
    );
  };

  // Priority badge component - shows raw DB value (A, B, C, D)
  const PriorityBadge = ({ priority }) => {
    const colors = {
      'A': 'bg-red-100 text-red-700',
      'B': 'bg-orange-100 text-orange-700',
      'C': 'bg-yellow-100 text-yellow-700',
      'D': 'bg-gray-100 text-gray-700',
    };
    const key = priority?.charAt(0)?.toUpperCase();
    const colorClass = colors[key] || 'bg-gray-100 text-gray-700';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {priority || 'N/A'}
      </span>
    );
  };

  // Render cell value
  const renderCell = (row, col) => {
    if (col.render) {
      return col.render(row[col.key], row);
    }

    const value = row[col.key];

    switch (col.type) {
      case 'status':
        return <StatusBadge status={value} />;
      case 'priority':
        return <PriorityBadge priority={value} />;
      case 'number':
        return value?.toLocaleString() || '0';
      case 'currency':
        return `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'date':
        return value ? new Date(value).toLocaleDateString() : 'N/A';
      default:
        return value || '-';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-one-magenta focus:border-transparent"
          />
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    <span className="text-gray-400">{getSortIcon(col.key)}</span>
                    {(col.type === 'status' || col.type === 'priority' || col.filterable) &&
                      renderFilterDropdown(col)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-gray-200">
        <Pagination
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Close dropdown on outside click */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}

export default FilterableTable;
