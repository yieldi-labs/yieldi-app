import { StakeProvider } from "@/context/StakeContext";

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
