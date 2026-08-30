import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Bebas_Neue, Montserrat, Oswald, Poppins, Anton, Playfair_Display, Pacifico, Lobster, Arvo, Space_Grotesk, Bungee } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bebas-neue" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", variable: "--font-montserrat" });
const oswald = Oswald({ subsets: ["latin"], display: "swap", variable: "--font-oswald" });
const poppins = Poppins({ weight: ["400", "600", "700"], subsets: ["latin"], display: "swap", variable: "--font-poppins" });
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-anton" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], display: "swap", variable: "--font-playfair" });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-pacifico" });
const lobster = Lobster({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-lobster" });
const arvo = Arvo({ weight: ["400", "700"], subsets: ["latin"], display: "swap", variable: "--font-arvo" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space-grotesk" });
const bungee = Bungee({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-bungee" });

export const metadata: Metadata = {
  title: "PsycheStore - Custom T-Shirts",
  description: "Design your own custom t-shirts",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${bebasNeue.variable} ${montserrat.variable} ${oswald.variable} ${poppins.variable} ${anton.variable} ${playfairDisplay.variable} ${pacifico.variable} ${lobster.variable} ${arvo.variable} ${spaceGrotesk.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
