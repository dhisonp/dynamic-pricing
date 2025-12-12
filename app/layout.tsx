import type { Metadata } from "next";
import { Inter, Source_Code_Pro, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500", "600", "700"], // Regular, Medium, Semi-bold, Bold
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Event Sales Analytics",
  description: "24-month ticket sales dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${sourceCodePro.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
