import React from "react";

import SocialIcons from "./SocialIcons";

interface DesktopMenuProps {
  onClose?: () => void;
}

const DesktopMenu: React.FC<DesktopMenuProps> = ({ onClose }) => {
  return (
    <div className="flex flex-row items-center py-[30px] px-2.5 bg-yieldi-beige border-y border-l border-yieldi-gray-200 w-56 absolute right-0 justify-center">
      <div className="flex flex-row items-center justify-center gap-6">
        <SocialIcons onClose={onClose} />
      </div>
    </div>
  );
};

export default DesktopMenu;
