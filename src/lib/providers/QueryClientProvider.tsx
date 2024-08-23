"use client";

import {
  QueryClientProvider as RqQueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { useState } from "react";

export default function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <RqQueryClientProvider client={queryClient}>
      {children}
    </RqQueryClientProvider>
  );
}
