export interface ITechnicalSpec {
  name: string;
  value: string;
}

export interface ISpecificationValue {
  value: string;
  slug: string;
  additionalPrice?: number;
  discountPrice?: number;
  thumbnail?: string;
  displayOrder?: number;
}

export interface ISpecificationGroup {
  title: string;
  specs: ITechnicalSpec[];
  values?: ISpecificationValue[]; // Make values optional
}

export interface ISpecification {
  _id: string;
  name: string;
  slug: string;
  title: string;
  groups: ISpecificationGroup[];
  categories: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ICreateSpecification = Omit<ISpecification, '_id' | 'createdAt' | 'updatedAt'>;
export type IUpdateSpecification = Partial<ICreateSpecification>; 