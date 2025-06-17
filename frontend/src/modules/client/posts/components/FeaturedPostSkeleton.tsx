"use client";
import type { FC } from "react";

const FeaturedPostSkeleton: FC = () => (
  <div className="relative overflow-hidden rounded-xl mb-10 animate-pulse bg-gray-200 h-[500px] w-full">
    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
      <div className="inline-block bg-gray-300 h-6 w-20 rounded mb-3" />
      <div className="h-10 w-2/3 bg-gray-300 rounded mb-3" />
      <div className="flex items-center space-x-2 mb-4">
        <div className="h-4 w-16 bg-gray-300 rounded" />
        <div className="h-4 w-4 bg-gray-300 rounded-full" />
        <div className="h-4 w-16 bg-gray-300 rounded" />
      </div>
      <div className="h-8 w-32 bg-gray-300 rounded" />
    </div>
  </div>
);

export default FeaturedPostSkeleton;