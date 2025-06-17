"use client";
import type { FC } from "react";

const SecondaryFeaturedPostSkeleton: FC = () => (
  <div className="grid md:grid-cols-5 gap-6 items-center mb-8 pb-8 border-b animate-pulse">
    <div className="md:col-span-2 h-[240px] bg-gray-200 rounded-lg" />
    <div className="md:col-span-3 space-y-3">
      <div className="h-7 w-2/3 bg-gray-200 rounded" />
      <div className="flex items-center space-x-2">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </div>
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="h-8 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

export default SecondaryFeaturedPostSkeleton;