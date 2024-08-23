"use client";

import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { StakeProvider } from "@/context/StakeContext";

import "./globals.css";
import "react-responsive-modal/styles.css";
import Navbar from "./components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <StakeProvider>
            <Theme
              accentColor="yellow"
              grayColor="gray"
              panelBackground="translucent"
              radius="full"
            >
              <Navbar />
              {children}
            </Theme>
          </StakeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
