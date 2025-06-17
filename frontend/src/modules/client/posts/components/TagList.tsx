"use client";
import type { FC } from "react";

const tags = ["Tin tức", "Hướng dẫn", "Kiến thức", "Mẹo hay"];

const TagList: FC = () => (
  <div className="bg-gray-50 p-6 rounded-xl">
    <h3 className="text-xl font-bold mb-4">Thẻ</h3>
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-white px-3 py-1 rounded-full text-sm shadow"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

export default TagList;