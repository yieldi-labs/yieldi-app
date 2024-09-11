import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Brand from "@/app/components/Brand";

import Wallet, { WalletProps } from "../Wallet";

import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

const Navbar: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 w-full z-40 border border-yieldi-gray-200">
      <nav className="flex items-center justify-between pl-8 text-white bg-yieldi-beige h-[55px]">
        <div className="flex items-center pl-2 text-black">
          <Brand />
          <div className="hidden md:flex">
            <div className="border">
              <span
                className={`flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                  pathName === "/dashboard"
                    ? "border-b-2 border-yieldi-gray-200 pb-2 font-bold"
                    : ""
                }`}
              >
                <Link href="/dashboard">DASHBOARD</Link>
              </span>
            </div>
            <div className="border border-yieldi-gray-200">
              <span
                className={`flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                  pathName.includes("/stake")
                    ? "border-b-2 border-yieldi-gray-200 pb-2 font-bold"
                    : ""
                }`}
              >
                <Link href="/stake">STAKE</Link>
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Wallet setConnectModalOpen={setConnectModalOpen} />
          <button
            className="flex w-[56px] justify-center items-center gap-[10px] self-stretch"
            onClick={toggleMenu}
          >
            <Image
              src="/menu.svg"
              alt="menu"
              width={0}
              height={0}
              className="flex w-[38px] h-[41px] px-[4.75px] py-[10.25px] flex-col justify-center items-center shrink-0"
            />
          </button>
        </div>
      </nav>
      <div className={`${isMenuOpen ? "block" : "hidden"}`}>
        <div className="md:hidden">
          <MobileMenu
            onClose={() => {
              setIsMenuOpen(false);
            }}
          />
        </div>
        <div className="hidden md:block">
          <DesktopMenu
            onClose={() => {
              setIsMenuOpen(false);
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
