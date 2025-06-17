import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';
import { CreateReviewDto } from '../dtos/create-review.dto';
import { Order } from '../../orders/schemas/order.schema';
import { Checkout } from '../../checkouts/schemas/checkout.schema';
import { Product } from '../../products/schemas/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  private async canUserReviewProduct(userId: string, productSlug: string): Promise<boolean> {
    try {
      // First find the product by slug
      const product = await this.productModel.findOne({ slug: productSlug }).exec();
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Find completed orders for this user that contain the product
      const orders = await this.orderModel.find({
        'orderItems.product': product._id,
        status: 'completed',
      }).exec();

      if (orders.length === 0) {
        return false;
      }

      // For each completed order, check if its checkout is paid
      for (const order of orders) {
        const checkout = await this.checkoutModel.findOne({
          orderId: order._id,
          userId: new Types.ObjectId(userId),
          paymentStatus: 'paid'
        }).exec();

        if (checkout) {
          return true; // Found at least one order that is both completed and paid
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking if user can review product:', error);
      return false;
    }
  }

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Check if user has already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      userId: new Types.ObjectId(createReviewDto.userId),
      productSlug: createReviewDto.productSlug,
    }).exec();

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Check if user has purchased, received the product and paid for it
    const canReview = await this.canUserReviewProduct(
      createReviewDto.userId,
      createReviewDto.productSlug,
    );

    if (!canReview) {
      throw new BadRequestException('You can only review products you have purchased, received and paid for');
    }

    const createdReview = new this.reviewModel({
      ...createReviewDto,
      userId: new Types.ObjectId(createReviewDto.userId),
      isVerifiedPurchase: true,
    });
    return createdReview.save();
  }

  async findAll(): Promise<Review[]> {
    return this.reviewModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByProductSlug(slug: string): Promise<Review[]> {
    return this.reviewModel
      .find({ productSlug: slug, isActive: true })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async update(id: string, updateReviewDto: Partial<CreateReviewDto>): Promise<Review> {
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .exec();
    if (!updatedReview) {
      throw new NotFoundException('Review not found');
    }
    return updatedReview;
  }

  async remove(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    ).exec();
    if (!result) {
      throw new NotFoundException('Review not found');
    }
  }

  async getProductRating(slug: string): Promise<{ averageRating: number; totalReviews: number }> {
    const reviews = await this.reviewModel
      .find({ productSlug: slug, isActive: true })
      .exec();

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return { averageRating: 0, totalReviews: 0 };
    }

    const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = sumRatings / totalReviews;

    return {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    };
  }
}