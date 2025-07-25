"use client";

import React, { useState } from 'react';
import { DEFAULT_PRICE_RANGES, FilterRangeProps } from '../types/filter.types';

export const PriceRangeFilter: React.FC<FilterRangeProps> = ({
  value = '',
  onChange,
  ranges = DEFAULT_PRICE_RANGES
}) => {
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsCustomRange(false);
    setMinPrice('');
    setMaxPrice('');
  };

  const handleCustomRangeChange = () => {
    if (minPrice || maxPrice) {
      onChange(`${minPrice || '0'}-${maxPrice || '999999999'}`);
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(price));
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium text-gray-900 mb-2">Khoảng giá</div>
        <div className="mt-2 space-y-2">
          {ranges.map((range) => {
            const checked = value === range.value && !isCustomRange;
            return (
              <label
                key={range.value}
                className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${
                  checked ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name="price-range"
                  value={range.value}
                  checked={checked}
                  onChange={handleRadioChange}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className={`ml-3 text-sm font-medium ${checked ? 'text-blue-900' : 'text-gray-900'}`}>
                  {range.label}
                </span>
                {checked && (
                  <span className="ml-auto shrink-0 text-blue-500 flex items-center">
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <circle cx={12} cy={12} r={12} fill="currentColor" opacity="0.2" />
                      <path
                        d="M7 13l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-blue-600"
            checked={isCustomRange}
            onChange={(e) => {
              setIsCustomRange(e.target.checked);
              if (!e.target.checked) {
                setMinPrice('');
                setMaxPrice('');
              }
            }}
          />
          <span className="ml-2 text-sm text-gray-700">Tùy chọn khoảng giá</span>
        </label>

        {isCustomRange && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá từ
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Đến
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="999999999"
                  min="0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleCustomRangeChange}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>

      {value && (
        <div className="mt-2 text-sm text-gray-500">
          Khoảng giá đang chọn:{' '}
          {value.split('-').map((price, index) => (
            <span key={price}>
              {index === 0 ? 'Từ ' : ' đến '}
              {formatPrice(price)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};