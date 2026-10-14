import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "GlobalData — design sprints",
  description: "Sprint prototypes for GlobalData, built with shadcn/ui in light mode.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // Browser extensions — Google Tag Assistant among them — write attributes
    // onto <html> before React hydrates, which the dev overlay reports as a
    // hydration mismatch. This only silences attribute differences on this one
    // element; anything inside it is still checked.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  )
}
