import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: 'Regex Visualizer — Interactive Regular Expression Tester',
  description: 'Test, debug, and visualize regular expressions with live matching, group capture, and plain-English explanations.',
  icons: {
    icon: '/favicon.svg',
  },
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className={`${inter.className} antialiased`}>{children}</body></html>
  )
}
