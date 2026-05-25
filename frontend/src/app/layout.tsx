import type { Metadata } from "next";
import { Oswald, Outfit, Poppins } from "next/font/google";
import "./globals.css";
import IkonLayout from "./IkonLayout";
export const dynamic = "force-dynamic";

const poppins = Poppins({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poppins',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-outfit',
});

const oswald = Oswald({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-oswald',
});
export const metadata: Metadata = {
  title: "Task Management", //your app title
  description: "", //your app description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${outfit.variable} ${oswald.variable} antialiased`}
      >
        <IkonLayout baseUrl={process.env.BASE_API_URL!}
          platformUrl={process.env.IKON_PLATFORM_UI_URL!}>
          {children}
        </IkonLayout>
      </body>
    </html>
  );
}
