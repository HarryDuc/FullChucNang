"use client";
import type { FC } from "react";

interface PostExcerptProps {
  html: string;
}

const PostExcerpt: FC<PostExcerptProps> = ({ html }) => (
  <div
    className="mb-4 text-gray-700 italic"
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export default PostExcerpt;