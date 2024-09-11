import Link from "next/link";

const NavLink = ({
  children,
  href,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) => (
  <Link
    href={href}
    target="_blank"
    onClick={onClick}
    {...props}
    className={`text-center duration-150 ${props?.className || ""}`}
  >
    {children}
  </Link>
);

export default NavLink;
