import Link from "next/link";
import React from "react";

import SocialIcons from "./SocialIcons";

interface MobileMenuProps {
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href) {
      onClose();
      window.location.href = href;
    }
  };

  return (
    <div className="h-screen w-full bg-yieldi-beige border-y border-yieldi-gray-200 flex flex-col items-start justify-start text-left text-xl text-yieldi-brown font-gt-america">
      <div className="self-stretch border-b border-yieldi-gray-200 flex flex-col items-start justify-start py-[30px] px-2.5 gap-4">
        {/* <Link
          href="/dashboard"
          className="w-[370px] flex items-center text-xl font-medium"
          onClick={handleLinkClick}
        >
          DASHBOARD
        </Link> */}
        <Link
          href="/stake"
          className="w-full flex items-center text-xl font-medium"
          onClick={handleLinkClick}
        >
          STAKE
        </Link>
        <div className="self-stretch flex flex-row items-center justify-start gap-4">
          <span className="flex-1 opacity-40">OPERATOR</span>
          <span className="text-xs opacity-40">COMING SOON</span>
        </div>
        <div className="self-stretch flex flex-row items-center justify-start gap-4">
          <span className="flex-1 opacity-40">AVS</span>
          <span className="text-xs opacity-40">COMING SOON</span>
        </div>
      </div>
      <div className="border-b border-yieldi-gray-200 w-full">
        <div className="self-stretch flex flex-col items-start justify-start py-[30px] px-2.5 gap-4 text-sm">
          <div className="w-full flex items-center text-sm font-light">
            LINKS
          </div>
          <div className="h-[38px] flex flex-row items-end justify-start gap-6">
            <SocialIcons onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
