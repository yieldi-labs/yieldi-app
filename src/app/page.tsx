"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

import Wallet from "@/app/components/Wallet";

export default function Home() {
  const router = useRouter();

  const navigateToStakeBTC = () => {
    router.push("/stake/btc");
  };

  return (
    <>
      <Accordion.Root type="single" defaultValue="item-1" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>Radix-UI is being used here</Accordion.Trigger>
          </Accordion.Header>
        </Accordion.Item>
      </Accordion.Root>
      <div style={{ marginTop: "2rem" }}>
        <Wallet />
      </div>
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
