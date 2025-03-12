import React from "react";
import HeaderMenu from "@/components/HeaderMenu";
import Logo from "@/components/Logo";

const Header = () => {
  return <header className="bg-white border-b border-b-gray-400 py-5">
  
   <HeaderMenu />
   <Logo />
   <div>right</div>
  </header>;
}

export default Header;
