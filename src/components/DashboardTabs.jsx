function DashboardTabs({ sections, activeTab, onTabChange }) {
  const enabledSections = Object.entries(sections).filter(([, config]) => config.enabled);

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {enabledSections.map(([key, config]) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`
              whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === key
                ? 'border-one-magenta text-one-magenta'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {config.label}
            {config.requiresVessel && (
              <span className="ml-1 text-xs text-gray-400">(vessel)</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default DashboardTabs;
