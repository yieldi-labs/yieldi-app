import Image from "next/image";
import Link from "next/link";

const Brand = () => (
    <Link href="/" className="flex justify-center align-middle mr-5">
        <Image src="/logo.svg" alt="Yieldi Logo" width={159} height={34} />
    </Link>
)
export default Brand