import { NextPage } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Brand from "@/app/components/Brand";

import Wallet, { WalletProps } from "../Wallet";

const Navbar: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  const pathName = usePathname();

  return (
    <header className="fixed top-0 w-full z-40">
      <nav className="flex items-center justify-between pl-8 text-white bg-[#D9D9D9] h-[55px]">
        <div className="flex items-center pl-2 text-black">
          <Brand />
          <span
            className={`p-2 ${
              pathName === "/dashboard" ? "border-b-2 border-black pb-2" : ""
            }`}
          >
            <Link href="/dashboard">DASHBOARD</Link>
          </span>
          <span
            className={`p-2 ${
              pathName.includes("/stake") ? "border-b-2 border-black pb-2" : ""
            }`}
          >
            <Link href="/stake">RESTAKE</Link>
          </span>
        </div>
        <Wallet setConnectModalOpen={setConnectModalOpen} />
      </nav>
    </header>
  );
};

export default Navbar;
