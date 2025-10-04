import type React from "react"
import type { Metadata } from "next"
import { Geist as Geist_Sans, Inter } from "next/font/google"
import "./globals.css"

const geistSans = Geist_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Subasport.com - Subastas de Camisetas Deportivas",
  description: "La mejor plataforma para subastar camisetas de tus equipos favoritos",
  generator: "v0.app",
  icons: [
    {
      rel: "icon",
      type: "image/svg+xml",
      url: "/favicon.svg",
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${inter.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${geistSans.style.fontFamily};
  --font-sans: ${geistSans.variable};
  --font-mono: ${inter.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
