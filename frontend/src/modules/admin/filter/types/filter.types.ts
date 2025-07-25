export interface RangeOption {
  label: string;
  min: number;
  max: number;
}

export interface Filter {
  _id: string;
  name: string;
  type: 'select' | 'checkbox' | 'range' | 'text' | 'number';
  options: string[];
  rangeOptions?: RangeOption[];
  categories?: Array<string | { _id: string; name: string }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateFilterDto {
  name: string;
  type: Filter['type'];
  options: string[];
  rangeOptions?: RangeOption[];
  categories?: string[];
}

// DTO cho cập nhật - tất cả trường đều optional
export interface UpdateFilterDto extends Partial<CreateFilterDto> {}

export interface PriceRange {
  label: string;
  value: string;
}

export interface FilterRangeProps {
  value?: string;
  onChange: (value: string) => void;
  ranges?: PriceRange[];
}

export const DEFAULT_PRICE_RANGES: PriceRange[] = [
  { label: "Tất cả", value: "" },
  { label: "Dưới 500.000đ", value: "0-500000" },
  { label: "500.000đ - 1.000.000đ", value: "500000-1000000" },
  { label: "1.000.000đ - 2.000.000đ", value: "1000000-2000000" },
  { label: "2.000.000đ - 5.000.000đ", value: "2000000-5000000" },
  { label: "Trên 5.000.000đ", value: "5000000-999999999" }
]; 