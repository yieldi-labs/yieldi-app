import { NextPage } from "next";

import Brand from "@/app/components/Brand";

import Wallet, { WalletProps } from "../Wallet";

const Navbar: NextPage<WalletProps> = ({ setConnectModalOpen }) => {
  return (
    <header className="fixed top-0 w-full z-40">
      <nav className="flex items-center justify-between py-4 px-8 text-white">
        <Brand />
        <Wallet setConnectModalOpen={setConnectModalOpen} />
      </nav>
    </header>
  );
};

export default Navbar;
