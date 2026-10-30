import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Meme Templates: top 100, no watermark",
  description: "The 100 most popular meme templates. Add your text and download a clean PNG.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-100">{children}</body>
    </html>
  );
}
