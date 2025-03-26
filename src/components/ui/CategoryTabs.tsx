
import { useState } from "react";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
}

const CategoryTabs = ({ categories, activeCategory, onChange }: CategoryTabsProps) => {
  return (
    <div className="mb-6 overflow-x-auto scrollbar-none -mx-4 px-4">
      <div className="flex space-x-2 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === category
                ? "bg-idolyst-blue text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
