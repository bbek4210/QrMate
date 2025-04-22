import React, { useState, useEffect } from "react";
import CrossIcon from "./svgs/cross-icon";

type FilterCategories = "event" | "position" | "field" | "city";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Record<FilterCategories, string>) => void;
  filterOptions: {
    event: string[];
    position: string[];
    field: string[];
    city: string[];
  };
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  filterOptions,
}) => {
  const [selectedFilters, setSelectedFilters] = useState<
    Record<FilterCategories, string>
  >({
    event: "",
    position: "",
    field: "",
    city: "",
  });

  const [expandedFilters, setExpandedFilters] = useState<
    Partial<Record<FilterCategories, boolean>>
  >({});

  const [activeCategoryForPopup, setActiveCategoryForPopup] =
    useState<FilterCategories | null>(null);
  const [popupSelectedOption, setPopupSelectedOption] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setSelectedFilters({
        event: "",
        position: "",
        field: "",
        city: "",
      });
      setExpandedFilters({});
    }
  }, [isOpen]);

  const toggleFilter = (category: FilterCategories, value: string) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? "" : value,
    }));
  };

  const toggleExpand = (category: FilterCategories) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const filterConfig: {
    title: string;
    category: FilterCategories;
    options: string[];
  }[] = [
    {
      title: "Filter by Event",
      category: "event",
      options: filterOptions.event,
    },
    {
      title: "Filter by Position",
      category: "position",
      options: filterOptions.position,
    },
    {
      title: "Filter by Field",
      category: "field",
      options: filterOptions.field,
    },
    { title: "Filter by City", category: "city", options: filterOptions.city },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto bg-black/50"
            : "pointer-events-none bg-transparent"
        }`}
        onClick={onClose}
      >
        <div
          className={`w-full h-[85dvh] bg-[#232322] rounded-t-2xl shadow-xl transform transition-transform duration-300 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Apply Filters</h3>
            <button onClick={onClose} className="text-white">
              <CrossIcon />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[65vh]">
            {filterConfig.map(({ title, category, options }) => {
              const isExpanded = expandedFilters[category] ?? false;
              const visibleOptions = isExpanded
                ? options
                : Array.from(
                    new Set(
                      selectedFilters[category]
                        ? [selectedFilters[category], ...options.slice(0, 3)]
                        : options.slice(0, 3)
                    )
                  );

              const hasMore = options.length > 3;

              return (
                <div key={category} className="mb-8">
                  <h4 className="mb-2 text-white text-[1.2rem] font-semibold">
                    {title}
                  </h4>
                  {options.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pb-2">
                      {visibleOptions.map((option) => (
                        <button
                          key={option}
                          className={`flex-shrink-0 px-4 py-2 text-sm font-semibold border border-gray-400 rounded-[29px] ${
                            selectedFilters[category] === option
                              ? "bg-[#ED2944] text-white border-white "
                              : "bg-transparent text-white hover:bg-gray-700 "
                          }`}
                          onClick={() => toggleFilter(category, option)}
                        >
                          {option}
                        </button>
                      ))}
                      {hasMore && (
                        <button
                          onClick={() => {
                            setPopupSelectedOption(selectedFilters[category]);
                            setActiveCategoryForPopup(category);
                          }}
                          className="px-4 py-2 text-sm font-semibold text-white bg-[#919191] border border-white rounded-[29px] shadow-[0_0_8px_rgba(237,41,68,0.5)] hover:bg-[#919191] hover:shadow-[0_0_12px_rgba(237,41,68,0.8)] transition-all mt-2"
                        >
                          ▼ See More
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 border border-gray-400 border-dashed rounded-md">
                      There are no {title} available.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-4 py-6">
            <button
              onClick={() => onApply(selectedFilters)}
              className="w-full py-3 text-lg font-semibold text-white bg-[#ED2944] border border-white rounded-[29px] hover:bg-yellow-600"
            >
              Show Results
            </button>
          </div>
        </div>
      </div>

      {activeCategoryForPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
          <div className="w-full h-[60dvh] bg-[#1e1e1e] rounded-t-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white capitalize">
                Select {activeCategoryForPopup}
              </h2>
              <button
                onClick={() => setActiveCategoryForPopup(null)}
                className="text-white"
              >
                <CrossIcon />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto grow">
              {filterOptions[activeCategoryForPopup].map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 p-3 border border-white/10 rounded-lg bg-[#2a2a2a] text-white"
                >
                  <input
                    type="radio"
                    name="popup-selection"
                    checked={popupSelectedOption === option}
                    onChange={() => setPopupSelectedOption(option)}
                    className="accent-[#ED2944]"
                  />
                  {option}
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedFilters((prev) => ({
                  ...prev,
                  [activeCategoryForPopup]: popupSelectedOption,
                }));
                setActiveCategoryForPopup(null);
              }}
              className="mt-4 py-3 text-white bg-[#ED2944] border border-white rounded-[29px] text-lg font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterDrawer;
