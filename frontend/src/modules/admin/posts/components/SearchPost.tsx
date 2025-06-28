"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchProductsProps {
  onSearch: (searchTerm: string) => void;
  isSearching?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

const SearchProducts = ({
  onSearch = (term: string) => {},
  isSearching = false,
  placeholder = "Nhập tên bài viết cần tìm...",
  defaultValue = "",
}: SearchProductsProps) => {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [debouncedTerm, setDebouncedTerm] = useState(defaultValue);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex rounded-md shadow-sm relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isSearching}
          className="flex-1 block w-full rounded-l-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
        <button
          type="submit"
          title="Tìm kiếm"
          disabled={isSearching}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FaSearch />
        </button>
      </div>
    </form>
  );
};

export default SearchProducts;
