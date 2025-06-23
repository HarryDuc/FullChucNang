import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum PostStatus {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

/**
 * Định nghĩa cấu trúc của CategoryInfo chứa thông tin liên quan đến danh mục.
 */
export const CategoryPathsSchema = {
  main: { type: [String], default: [] },
  sub: { type: [String], default: [] },
};

@Schema({ _id: false })
export class PostMeta {
  @Prop({ default: 0 }) likes: number;
  @Prop({ default: 0 }) views: number;
  @Prop({ default: 0 }) shares: number;
  @Prop({ default: 0 }) bookmarks: number;
}
export const PostMetaSchema = SchemaFactory.createForClass(PostMeta);

@Schema({ timestamps: true })
export class Post {
  // 🆔 Metadata
  @Prop({ required: true, index: true }) slug: string;
  @Prop({ required: true, index: true }) userId: string;
  @Prop() createdBy: string;
  @Prop() updatedBy: string;
  @Prop() approvedBy: string;

  // 📝 Nội dung
  @Prop({ required: true }) name: string;
  @Prop() excerpt: string;
  @Prop() postData: string;
  @Prop() coverVideo?: string;
  @Prop({ type: [String], default: [] }) thumbnail: string[];
  @Prop({ type: [String], default: [] }) images: string[];
  @Prop({ type: PostMetaSchema, default: () => ({}) }) meta: PostMeta;

  // 📁 Phân loại
  @Prop({ type: CategoryPathsSchema })
  category?: {
    main: string[];
    sub: string[];
  };

  @Prop({ type: [String], default: [] }) tags: string[];

  // 👤 Tác giả
  @Prop({ index: true }) author: string;

  // ⏰ Trạng thái & thời gian
  @Prop({
    type: String,
    enum: PostStatus,
    default: PostStatus.Draft,
    index: true,
  })
  status: PostStatus;

  @Prop({ type: Date, index: true }) publishedDate: Date;
  @Prop({ type: Date }) approvedDate: Date;
  @Prop({ type: Date }) scheduledAt: Date;

  // 🔗 Hiển thị
  @Prop({ type: [String], default: [] }) relatedPostSlugs: string[];
  @Prop({ default: false }) isFeatured: boolean;
  @Prop({ default: false }) isPinned: boolean;
  @Prop({ default: true, index: true }) isVisible: boolean;

  @Prop({ default: false, index: true }) isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = Post & Document;
export const PostSchema = SchemaFactory.createForClass(Post);

// 📌 Indexes tối ưu hoá

// 🔍 Tìm kiếm văn bản (chỉ có 1 text index cho toàn collection)
PostSchema.index({ name: 'text', author: 'text' });

// 📂 Truy vấn theo phân loại và trạng thái
PostSchema.index({
  categoryPaths: 1,
  status: 1,
  publishedDate: -1,
  isDeleted: 1,
});

// 📋 Các truy vấn phổ biến khác
PostSchema.index({ author: 1, publishedDate: -1, isDeleted: 1 });
PostSchema.index({ status: 1, approvedDate: -1, isDeleted: 1 });
PostSchema.index({ scheduledAt: 1, status: 1, isDeleted: 1 });
PostSchema.index({ createdAt: -1, isDeleted: 1 });

// 🔗 Index cho bài viết ghim/nổi bật (partial index để giảm tài nguyên)
PostSchema.index(
  { isPinned: 1, publishedDate: -1 },
  { partialFilterExpression: { isPinned: true, isDeleted: false } },
);

PostSchema.index(
  { isFeatured: 1, publishedDate: -1 },
  { partialFilterExpression: { isFeatured: true, isDeleted: false } },
);

// 📈 Xếp hạng theo lượt xem
PostSchema.index(
  { 'meta.views': -1, publishedDate: -1 },
  { partialFilterExpression: { isDeleted: false, status: 'approved' } },
);

// 🔖 Truy vấn theo slug, đảm bảo unique
PostSchema.index({ slug: 1, isDeleted: 1 }, { unique: true });

// 🏷️ Tối ưu tìm kiếm tag
PostSchema.index({ tags: 1 }, { sparse: true });

// 👁️ Index cho trạng thái hiển thị
PostSchema.index({ isVisible: 1, status: 1, isDeleted: 1 });
