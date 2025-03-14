import React from "react";
import HeaderMenu from "@/components/HeaderMenu";
import Logo from "@/components/Logo";
import Container from "@/components/Container";
import config from '@/tailwind.config'

const Header = () => {
  return (
    <header className="border-b border-b-gray-400 py-5">
      <Container className="flex items-center justify-between gap-7 text-lightColor">
        <HeaderMenu />
        <Logo />
        <div>right</div> 
      </Container>
    </header>
  );
};

export default Header;
