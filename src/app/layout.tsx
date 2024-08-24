import "@/app/globals.css";
import "react-responsive-modal/styles.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";

import { StakeProvider } from "@/context/StakeContext";
import QueryClientProvider from "@/lib/providers/QueryClientProvider";

import Main from "./components/Main";

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
                accentColor="yellow"
                grayColor="gray"
                panelBackground="translucent"
                radius="full"
              >
                <Main>{children}</Main>
              </Theme>
            </body>
          </StakeProvider>
        </QueryClientProvider>
      </StrictMode>
    </html>
  );
}
