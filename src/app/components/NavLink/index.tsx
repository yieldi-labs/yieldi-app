import Link from "next/link";

const NavLink = ({
  children,
  href,
  ...props
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => (
  <Link
    href={href}
    {...props}
    className={`py-2.5 px-4 text-center rounded-lg duration-150 ${props?.className || ""}`}
  >
    {children}
  </Link>
);

export default NavLink;
