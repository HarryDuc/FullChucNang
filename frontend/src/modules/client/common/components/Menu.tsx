"use client";

import InfoBar from "./Menu/InfoBar";
import MenuMobile from "./Menu/MenuMobile";
import MenuPC from "./Menu/MenuPc";
import TopBar from "./Menu/TopBar";


const Menu = () => {
  return (
    <div className="sticky top-0 z-50 shadow">
      <MenuPC />
      <MenuMobile />
    </div>
  );
};

export default Menu;



