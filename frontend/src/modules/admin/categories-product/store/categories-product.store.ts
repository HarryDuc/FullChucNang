import { create } from 'zustand';
import { CategoriesProduct } from '../types/categories-product.types';
import { getCategoriesProduct } from '../services/categories-product.service';

interface CategoriesProductStore {
    categoriesProduct: CategoriesProduct[];
    fetchCategoriesProduct: () => Promise<void>;
}

export const useCategoriesProductStore = create<CategoriesProductStore>((set) => ({
    categoriesProduct: [],
    fetchCategoriesProduct: async () => {
        const categories = await getCategoriesProduct();
        set({ categoriesProduct: categories });
    },
}));
