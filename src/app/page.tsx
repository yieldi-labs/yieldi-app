"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { Theme, Button } from "@radix-ui/themes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const navigateToStakeBTC = () => {
    router.push("/stake/btc");
  };

  return (
    <Theme>
      <Accordion.Root type="single" defaultValue="item-1" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger>Radix-UI is being used here</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            Yes. It's unstyled by default, giving you freedom over the look and
            feel.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <div style={{ marginTop: "2rem" }}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
          lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
          malesuada. Nulla facilisi. Suspendisse potenti. Pellentesque habitant
          morbi tristique senectus et netus et malesuada fames ac turpis
          egestas.
        </p>
        <p>
          Curabitur ut sem in nulla pellentesque accumsan nec eget arcu. Etiam
          non quam elit. Integer ullamcorper ligula sed dolor bibendum
          scelerisque. Phasellus id nisi sit amet justo malesuada varius. Cras
          euismod felis sit amet justo egestas, ut aliquam justo tincidunt.
        </p>
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
    </Theme>
  );
}
