import React from 'react';
import Sidebar from '../../../common/components/Sidebar';
import { useRouter } from "next/navigation";

type PostLayoutProps = {
    children: React.ReactNode;
};

export const PostLayout: React.FC<PostLayoutProps> = ({ children }) => {
    const router = useRouter();

    return (
        <div className="flex h-screen">
            {/* Menu dọc bên trái */}
            <div className="w-1/4 bg-gray-100 p-4 border-r">
                <Sidebar />
            </div>

            {/* Nội dung con bên phải */}
            <div className="w-3/4 p-6 overflow-auto">
                {children}
            </div>
        </div>
    );
};
