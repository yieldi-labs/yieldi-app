import "./globals.css";
import "react-responsive-modal/styles.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";

import { StakeProvider } from "@/context/StakeContext";
import QueryClientProvider from "@/lib/providers/QueryClientProvider";

import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <StrictMode>
        <QueryClientProvider>
          <StakeProvider>
            <body>
              <Theme
                accentColor="gray"
                grayColor="gray"
                panelBackground="translucent"
                radius="full"
              >
                <Navbar>{children}</Navbar>
              </Theme>
            </body>
          </StakeProvider>
        </QueryClientProvider>
      </StrictMode>
    </html>
  );
}
