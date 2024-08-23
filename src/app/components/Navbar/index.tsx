"use client";

import Brand from "@/app/components/Brand"

import Wallet from '../Wallet';

const Navbar = () => {
  return (
    <header className='fixed top-0 w-full z-40'>
      <nav className="flex items-center justify-between py-4 px-8 text-white">
        <Brand />
        <Wallet />
      </nav>
    </header>
  )
}

export default Navbar