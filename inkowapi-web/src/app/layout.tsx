import type { Metadata } from 'next'
import { Open_Sans, Montserrat } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'InkoWapi',
  description: 'InkoWapi Dashboard Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} ${montserrat.variable} antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
