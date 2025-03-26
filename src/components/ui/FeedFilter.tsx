
interface FeedFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FeedFilter = ({ activeFilter, onFilterChange }: FeedFilterProps) => {
  const filters = [
    { id: "all", label: "All Posts" },
    { id: "following", label: "My Followings" },
    { id: "trending", label: "Trending" },
  ];

  return (
    <div className="flex mb-6 border-b border-gray-200 dark:border-gray-800">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-3 font-medium text-sm relative ${
            activeFilter === filter.id
              ? "text-idolyst-blue"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          {filter.label}
          {activeFilter === filter.id && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
          )}
        </button>
      ))}
    </div>
  );
};

export default FeedFilter;
