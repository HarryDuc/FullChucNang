export interface IReview {
  _id: string;
  productSlug: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  attributes?: string[];
  isActive: boolean;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}