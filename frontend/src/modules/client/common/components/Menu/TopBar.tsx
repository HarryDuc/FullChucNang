"use client";

import Link from "next/link";

const TopBar = () => {


  return (
    <div className="bg-[#effef5] text-white hidden md:block">
      <div className="container mx-auto flex justify-center relative px-4 py-2">
        <Link
          href="/"
        >
            <div >
              <div className="text-[#0cae5f] text-sm">Freeship đơn từ 45k, giảm nhiều hơn cùng <span className="text-blue-500 font-bold">FREESHIP</span> <span className="font-bold">XTRA</span></div>
            </div>
        </Link>

      </div>
    </div>
  );
};

export default TopBar;
