import { motion } from 'framer-motion';
import React from 'react';

/**
 * Tabs component for switching between multiple content panels
 */
export default function Tabs({ tabs = [], defaultTab = 0 }) {
  const [activeTab, setActiveTab] = React.useState(defaultTab);

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <motion.button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`
              px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
              ${
                activeTab === idx
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        {tabs[activeTab]?.content}
      </motion.div>
    </div>
  );
}
