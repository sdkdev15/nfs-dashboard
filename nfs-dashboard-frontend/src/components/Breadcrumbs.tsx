import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '../types';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <div className="flex items-center py-2 overflow-x-auto whitespace-nowrap mb-2">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          <button
            onClick={() => onNavigate(item.path)}
            className={`text-sm hover:text-blue-600 transition-colors ${
              index === items.length - 1
                ? 'font-semibold text-gray-800'
                : 'text-gray-600'
            }`}
          >
            {item.name}
          </button>
          {index < items.length - 1 && (
            <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;