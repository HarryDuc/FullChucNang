"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { usePage } from "../hooks/usePage";

const SunEditor = dynamic(() => import("suneditor-react"), {
  ssr: false,
});

import "suneditor/dist/css/suneditor.min.css";
import { removeVietnameseTones } from "@/common/utils/slug.utils";

interface PageFormProps {
  slug?: string;
  className?: string;
}

export const PageForm: React.FC<PageFormProps> = ({ slug, className = "" }) => {
  const router = useRouter();
  const {
    createPage,
    updatePage,
    getPageBySlug,
    loading: serviceLoading,
  } = usePage();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    const loadPage = async () => {
      if (slug) {
        try {
          const page = await getPageBySlug(slug);
          setFormData({
            name: page.name,
            slug: page.slug,
          });
          setContent(page.content);
        } catch (error) {
          console.error("Failed to load page:", error);
          router.push("/admin/create-page");
        }
      }
      setLoading(false);
    };

    loadPage();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...formData, content };
      if (slug) {
        await updatePage(slug, data);
      } else {
        await createPage(data);
      }
      router.push("/admin/create-page");
    } catch (error) {
      console.error("Failed to save page:", error);
    }
  };

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "name") {
        return {
          ...prev,
          [name]: value,
          slug: removeVietnameseTones(value),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">
          {slug ? "Edit Page" : "Create New Page"}
        </h2>
        <button
          onClick={() => router.push("/admin/create-page")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Page Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page name"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder="Slug will be generated automatically"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <SunEditor
            setContents={content}
            onChange={handleEditorChange}
            setOptions={{
              height: "400px",
              buttonList: [
                ["undo", "redo"],
                ["font", "fontSize", "formatBlock"],
                ["paragraphStyle", "blockquote"],
                [
                  "bold",
                  "underline",
                  "italic",
                  "strike",
                  "subscript",
                  "superscript",
                ],
                ["fontColor", "hiliteColor", "textStyle"],
                ["removeFormat"],
                ["outdent", "indent"],
                ["align", "horizontalRule", "list", "lineHeight"],
                ["table", "link", "image", "video"],
                ["fullScreen", "showBlocks", "codeView"],
                ["preview", "print"],
              ],
              defaultTag: "div",
              minHeight: "400px",
              showPathLabel: false,
            }}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={serviceLoading}
            className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              serviceLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {serviceLoading
              ? "Loading..."
              : slug
              ? "Update Page"
              : "Create Page"}
          </button>
        </div>
      </form>
    </div>
  );
};
