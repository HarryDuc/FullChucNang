"use client";
import type { FC } from "react";

interface PostThumbnailProps {
  src: string;
  alt: string;
}

const PostThumbnail: FC<PostThumbnailProps> = ({ src, alt }) => (
  <div className="relative h-[400px] w-full mb-8 rounded-xl overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="object-cover w-full h-full"
      crossOrigin="anonymous"
    />
  </div>
);

export default PostThumbnail;