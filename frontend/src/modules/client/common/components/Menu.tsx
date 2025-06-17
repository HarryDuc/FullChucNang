"use client";

import InfoBar from "./Menu/InfoBar";
import MenuMobile from "./Menu/MenuMobile";
import MenuPC from "./Menu/MenuPc";
import TopBar from "./Menu/TopBar";


const Menu = () => {
  return (
    <>
      <style jsx global>{`
        /* Global styles for both PC and Mobile menus */
        .submenu-product-item {
          border: 1px solid #d9ab17;
          padding: 8px 12px;
          text-align: center;
          color: #555;
          font-size: 15px;
          font-weight: 400;
          min-width: 160px;
          display: block;
          text-decoration: none;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .submenu-product-item:hover {
          border-color: #d26d00;
          color: #d26d00;
          background-color: rgba(242, 242, 242, 0.5);
        }

        /* Submenu container styling */
        .submenu-container {
          background-color: white;
          border: 1px solid #d9ab17;
          z-index: 50;
        }
      `}</style>
      {/* <TopBar /> */}
      <div className="sticky top-0 z-50 shadow">
        <MenuPC />
        <MenuMobile />
      </div>
    </>
  );
};

export default Menu;



