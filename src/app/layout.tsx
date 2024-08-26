import "@/app/globals.css";
import "react-responsive-modal/styles.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";

import { StakeProvider } from "@/app/context/StakeContext";
import { WalletProvider } from "@/app/context/WalletContext";

import Main from "./components/Main";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <StrictMode>
        <StakeProvider>
          <WalletProvider>
            <body>
              <Theme
                accentColor="yellow"
                grayColor="gray"
                panelBackground="translucent"
                radius="full"
              >
                <Main>{children}</Main>
              </Theme>
            </body>
          </WalletProvider>
        </StakeProvider>
      </StrictMode>
    </html>
  );
}
