import "@/app/globals.css";
import "react-responsive-modal/styles.css";

import { Theme } from "@radix-ui/themes";
import { StrictMode } from "react";

import Main from "./components/Main";
import Providers from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <StrictMode>
        <Providers>
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
        </Providers>
      </StrictMode>
    </html>
  );
}
