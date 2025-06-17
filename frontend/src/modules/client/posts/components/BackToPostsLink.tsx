"use client";
import Link from "next/link";
import type { FC } from "react";

const BackToPostsLink: FC = () => (
  <Link
    href="/posts"
    className="inline-flex items-center text-gray-600 hover:text-blue-600 py-4"
    tabIndex={0}
    aria-label="Quay lại danh sách bài viết"
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') (e.target as HTMLElement).click(); }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2"
      aria-hidden="true"
    >
      <path d="m12 19-7-7 7-7"></path>
      <path d="M19 12H5"></path>
    </svg>
    Quay lại danh sách bài viết
  </Link>
);

export default BackToPostsLink;