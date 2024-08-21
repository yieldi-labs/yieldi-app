"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { StakeProvider } from "@/context/StakeContext";

import "./globals.css";
import "react-responsive-modal/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StakeProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </StakeProvider>
    </QueryClientProvider>
  );
}
