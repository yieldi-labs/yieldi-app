import Image from "next/image";
import React from "react";

import discordIcon from "@public/icons/discord.svg";
import telegramIcon from "@public/icons/telegram.svg";
import xIcon from "@public/icons/x.svg";

import NavLink from "../NavLink";

interface SocialIconsProps {
  onClose?: () => void;
}

const SocialIcons: React.FC<SocialIconsProps> = ({ onClose }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClose) {
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      if (href) {
        onClose();
        window.open(href, "_blank");
      }
    }
  };

  return (
    <>
      <NavLink
        href="https://x.com/yieldi_xyz"
        className="duration-150 hover:scale-110 p-0"
        onClick={handleLinkClick}
      >
        <Image
          src={xIcon}
          alt=""
          width={38}
          height={38}
          className="overflow-hidden"
        />
      </NavLink>
      <NavLink
        href="https://t.me/yieldi_labs"
        className="duration-150 hover:scale-110 p-0"
        onClick={handleLinkClick}
      >
        <Image
          src={telegramIcon}
          alt=""
          width={38}
          height={38}
          className="object-cover"
        />
      </NavLink>
      <NavLink
        href="https://discord.gg/8aFPCXPwAd"
        className="duration-150 hover:scale-110"
        onClick={handleLinkClick}
      >
        <Image
          src={discordIcon}
          alt=""
          width={38}
          height={38}
          className="object-cover"
        />
      </NavLink>
    </>
  );
};

export default SocialIcons;
