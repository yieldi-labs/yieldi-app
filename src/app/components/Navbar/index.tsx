import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import Brand from "@/app/components/Brand";

import Wallet, { WalletProps } from "../Wallet";

import DesktopMenu from "./DesktopMenu";
import MobileMenu from "./MobileMenu";

const Navbar: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const pathName = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          menuButtonRef.current &&
          !menuButtonRef.current.contains(event.target as Node)
        ) {
          setIsMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 w-full z-40 border-b border-yieldi-gray-200 flex flex-col">
      <nav className="flex items-center justify-between text-white bg-yieldi-beige h-[55px] flex-1">
        <div className="flex items-center text-black shrink-0">
          <Brand />
          <div className="hidden md:flex">
            {/* <div className="border-yieldi-gray-200 border-x">
              <span
                className={`flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                  pathName === "/dashboard"
                    ? "pb-2 font-bold border-b-2 border-black"
                    : ""
                }`}
              >
                <Link href="/dashboard">DASHBOARD</Link>
              </span>
            </div> */}
            <div className="border-yieldi-gray-200 border-x">
              <span
                className={`flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                  pathName.includes("/stake")
                    ? "pb-2 font-bold border-b-2 border-black"
                    : ""
                }`}
              >
                <Link href="/stake">STAKE</Link>
              </span>
            </div>
          </div>
        </div>
        <div className="flex md:justify-end justify-center grow">
          <Wallet setConnectModalOpen={setConnectModalOpen} />
        </div>
        <button
          ref={menuButtonRef}
          className="flex shrink-0 w-[56px] justify-center items-center gap-[10px] self-stretch"
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
      </nav>
      <div ref={menuRef} className={`${isMenuOpen ? "block" : "hidden"}`}>
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
