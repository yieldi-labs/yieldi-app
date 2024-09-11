import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Brand from "@/app/components/Brand";

import Wallet, { WalletProps } from "../Wallet";

const Navbar: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const pathName = usePathname();

  return (
    <header className="fixed top-0 w-full z-40 border">
      <nav className="flex items-center justify-between pl-8 text-white bg-yieldi-beige h-[55px]">
        <div className="flex items-center pl-2 text-black">
          <Brand />
          <div className="border">
            <span
              className={`hidden md:flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                pathName === "/dashboard"
                  ? "border-b-2 border-black pb-2 font-bold"
                  : ""
              }`}
            >
              <Link href="/dashboard">DASHBOARD</Link>
            </span>
          </div>
          <div className="border">
            <span
              className={`hidden md:flex h-[56px] px-[30px] py-[10px] flex-col justify-center items-center gap-[10px] ${
                pathName.includes("/stake")
                  ? "border-b-2 border-black pb-2 font-bold"
                  : ""
              }`}
            >
              <Link href="/stake">STAKE</Link>
            </span>
          </div>
        </div>
        <div className="flex justify-center">
          <Wallet setConnectModalOpen={setConnectModalOpen} />
          <span className="flex w-[56px] justify-center items-center gap-[10px] self-stretch">
            <Image
              src="/menu.svg"
              alt="menu"
              width={0}
              height={0}
              className="flex w-[38px] h-[41px] px-[4.75px] py-[10.25px] flex-col justify-center items-center shrink-0"
            />
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
