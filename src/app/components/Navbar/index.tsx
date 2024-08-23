import Brand from "@/app/components/Brand";

import Wallet from "../Wallet";

const Navbar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <header className="fixed inset-x-0 w-full z-10 bg-white">
        <nav className="flex items-center justify-between p-4 lg:px-8 text-white">
          <Brand />
          <Wallet />
        </nav>
      </header>
      <main className="h-screen grow pt-24">{children}</main>
    </div>
  );
};

export default Navbar;
