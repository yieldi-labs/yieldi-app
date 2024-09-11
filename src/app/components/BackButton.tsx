import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const BackButton: React.FC<{ text: string }> = ({ text }) => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="flex text-yieldi-brown text-xs items-center space-x-2 mb-4"
    >
      <Image
        src="/arrow_back.svg"
        alt="Back"
        width={16}
        height={16}
        className="cursor-pointer"
      ></Image>
      <span>{text}</span>
    </button>
  );
};

export default BackButton;
