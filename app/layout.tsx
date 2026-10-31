import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito, Poppins } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ScreenLoaderProvider } from "@/components/ui/ScreenLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Huttspot",
  description: "Get Affordable Accomodation",
  icons: "/images/logo.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the saved dashboard theme before first paint (no flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("huttspot_theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${nunito.variable} antialiased`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <ScreenLoaderProvider>{children}</ScreenLoaderProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
