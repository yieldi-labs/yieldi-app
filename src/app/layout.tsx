import { StakeProvider } from "@/context/StakeContext";

import "./globals.css";
import "react-responsive-modal/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StakeProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </StakeProvider>
  );
}
