"use client";

import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const navigateToStakeBTC = () => {
    router.push("/stake/btc");
  };

  return (
    <>
      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <Button
          onClick={navigateToStakeBTC}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.5rem",
            backgroundColor: "#0070f3",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go to Stake BTC
        </Button>
      </div>
    </>
  );
}
