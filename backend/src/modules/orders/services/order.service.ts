import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { CreateOrderDto, UpdateOrderDto } from '../dtos/order.dto';
import { removeVietnameseTones } from 'src/common/utils/slug.utils';
import { Product } from '../../products/schemas/product.schema';

/**
 * OrderService xử lý các thao tác CRUD cho đơn hàng.
 * - Sử dụng slug làm định danh duy nhất cho đơn hàng.
 * - Tự động tạo slug nếu không được cung cấp; nếu trùng sẽ thêm hậu tố -1, -2,... cho đến khi slug duy nhất.
 * - Tính toán totalPrice dựa trên giá (price) và số lượng (quantity) được gửi từ frontend.
 * - Quản lý trạng thái đơn hàng (status).
 */
@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) { }

  /**
   * Tạo mã đơn hàng theo định dạng DM + 6 chữ số
   * @returns Mã đơn hàng dạng DM123456
   */
  private async generateOrderCode(length: number = 8): Promise<string> {
    // 🔢 Tạo mã đơn hàng dạng DM + số chữ số ngẫu nhiên theo length
    let min = Math.pow(10, length - 1);
    let max = Math.pow(10, length) - 1;
    let orderCode = `DM${Math.floor(min + Math.random() * (max - min + 1))}`;

    // 🔄 Kiểm tra xem mã đã tồn tại chưa, nếu có thì tạo lại
    const existingOrder = await this.orderModel.findOne({ orderCode }).exec();
    if (existingOrder) {
      return this.generateOrderCode(length);
    }
    return orderCode;
  }

  /**
   * Tạo slug duy nhất cho đơn hàng.
   *   * - Sinh một chuỗi ngẫu nhiên gồm 8 ký tự, chuẩn hóa bằng hàm removeVietnameseTones và chuyển thành chữ thường.
   * - Nếu slug trùng, tự động thêm hậu tố -1, -2, ... cho đến khi slug là duy nhất.
   * @returns Slug duy nhất.
   */
  private async generateUniqueSlug(): Promise<string> {
    const baseSlug = removeVietnameseTones(
      await this.generateOrderCode(),
    ).toUpperCase();
    let slug = baseSlug;
    let count = 1;
    while (await this.orderModel.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    return slug;
  }

  /**
   * Tính toán tổng giá đơn hàng dựa trên giá (price) và số lượng (quantity) của từng mặt hàng.
   * - Chèn await Promise.resolve() để đảm bảo hàm async có ít nhất 1 await.
   * @param order Đơn hàng cần tính.
   * @returns Tổng giá đơn hàng.
   */
  private async calculateTotalPrice(order: Order): Promise<number> {
    // Dummy await để thỏa mãn eslint: @typescript-eslint/require-await
    await Promise.resolve();
    let total = 0;
    for (const item of order.orderItems) {
      total += item.price * item.quantity;
    }
    return total;
  }

  /**
   * Tạo đơn hàng mới.
   * - Nếu không có slug từ DTO, tự tạo slug duy nhất.
   * - Sau khi lưu, tính toán totalPrice và cập nhật đơn hàng.
   * - Mặc định trạng thái là 'pending' nếu không được chỉ định.
   * @param createOrderDto Dữ liệu tạo đơn hàng.
   * @returns Đơn hàng đã được tạo.
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let slug = createOrderDto.slug;
    if (!slug) {
      slug = await this.generateUniqueSlug();
    } else {
      const existingOrder = await this.orderModel.findOne({ slug }).exec();
      if (existingOrder) {
        slug = await this.generateUniqueSlug();
      }
    }

    // Add null check for orderItems
    const orderItems =
      createOrderDto.orderItems?.map((item) => ({
        ...item,
        product: new Types.ObjectId(item.product),
      })) || [];

    const newOrder = new this.orderModel({
      ...createOrderDto,
      orderItems,
      slug,
      status: createOrderDto.status || 'pending', // Mặc định là 'pending'
    });

    const savedOrder = await newOrder.save();
    const total = await this.calculateTotalPrice(savedOrder);
    savedOrder.totalPrice = total;
    await savedOrder.save();
    return savedOrder;
  }

  /**
   * Lấy danh sách tất cả đơn hàng.
   * @returns Mảng đơn hàng.
   */
  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('orderItems.product', 'name').exec();
  }

  /**
   * Lấy thông tin đơn hàng theo slug.
   * @param slug Định danh duy nhất của đơn hàng.
   * @returns Đơn hàng tương ứng.
   * @throws NotFoundException nếu không tìm thấy.
   */
  async findOne(slug: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ slug })
      .populate('orderItems.product', 'name')
      .exec();
    if (!order) {
      throw new NotFoundException(`Order with slug ${slug} not found`);
    }
    return order;
  }

  /**
//    * Cập nhật đơn hàng theo slug.
//    * - Nếu cập nhật orderItems, tính lại totalPrice.
//    * - Nếu người dùng cập nhật slug, kiểm tra tính duy nhất; nếu trùng, trả về lỗi.
//    * @param slug Định danh của đơn hàng cần cập nhật.
//    * @param updateOrderDto Dữ liệu cập nhật.
//    * @returns Đơn hàng đã được cập nhật.
//    * @throws NotFoundException nếu không tìm thấy.
//    * @throws BadRequestException nếu slug mới bị trùng.
//    */
  async update(slug: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    if (updateOrderDto.slug) {
      const existingOrder = await this.orderModel
        .findOne({ slug: updateOrderDto.slug })
        .exec();
      if (existingOrder && existingOrder.slug !== slug) {
        throw new BadRequestException(
          `Slug ${updateOrderDto.slug} is already in use`,
        );
      }
    }

    let updatePayload: Partial<UpdateOrderDto> = { ...updateOrderDto };

    if (updateOrderDto.orderItems) {
      updatePayload.orderItems = updateOrderDto.orderItems.map((item) => ({
        ...item,
        product: new Types.ObjectId(item.product),
      })) as any; // 👈 ép kiểu nếu cần để tránh lỗi TS
    }

    const updatedOrder = await this.orderModel
      .findOneAndUpdate({ slug }, updatePayload, { new: true })
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException(`Order with slug ${slug} not found`);
    }

    if (updatePayload.orderItems) {
      const total = await this.calculateTotalPrice(updatedOrder);
      updatedOrder.totalPrice = total;
      await updatedOrder.save();
    }

    return updatedOrder;
  }

  /**
   * Xóa đơn hàng theo slug.
   * @param slug Định danh của đơn hàng cần xóa.
   * @returns Thông báo xác nhận xóa.
   * @throws NotFoundException nếu không tìm thấy đơn hàng.
   */
  async remove(slug: string): Promise<{ message: string }> {
    const deletedOrder = await this.orderModel
      .findOneAndDelete({ slug })
      .exec();
    if (!deletedOrder) {
      throw new NotFoundException(`Order with slug ${slug} not found`);
    }
    return { message: 'Order has been deleted successfully' };
  }
}
