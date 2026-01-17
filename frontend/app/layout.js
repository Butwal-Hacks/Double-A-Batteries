// main layout that wraps everything
// keep it simple
import './globals.css'
import Navbar from '@/components/Navbar'

// seo stuff
export const metadata = {
  title: 'CodeMentor - Explain Code Simply',
  description: 'Understand any code with AI-powered explanations designed for beginners',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
