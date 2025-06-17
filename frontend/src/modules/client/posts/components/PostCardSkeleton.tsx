"use client";
import type { FC } from "react";

const PostCardSkeleton: FC = () => (
  <div className="group animate-pulse">
    <div className="relative h-56 bg-gray-200 rounded-lg mb-3" />
    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
    <div className="flex items-center space-x-2 mb-2">
      <div className="h-3 w-12 bg-gray-200 rounded" />
      <div className="h-3 w-3 bg-gray-200 rounded-full" />
      <div className="h-3 w-12 bg-gray-200 rounded" />
    </div>
    <div className="h-4 w-full bg-gray-200 rounded mb-1" />
    <div className="h-4 w-2/3 bg-gray-200 rounded" />
  </div>
);

export default PostCardSkeleton;