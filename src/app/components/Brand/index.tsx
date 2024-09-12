import Image from "next/image";
import Link from "next/link";

const Brand = () => (
  <Link href="/" className="flex justify-center align-middle mr-5">
    <Image
      src="/logo.svg"
      alt="Yieldi Logo"
      width={0}
      height={0}
      className="w-24 h-auto hidden md:block"
    />
    <Image
      src="/logo_mobile.svg"
      alt="Yieldi Logo"
      width={0}
      height={0}
      className="w-auto h-[35px] md:hidden"
    />
  </Link>
);
export default Brand;
