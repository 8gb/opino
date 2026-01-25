import './globals.css';
import { Providers } from './providers';
import MainLayout from '../components/MainLayout';
import { ThemeProvider } from '../components/ThemeProvider';

export const metadata = {
  title: 'opino',
  description: 'Opino App',
}

export default function RootLayout({ children }) {
  console.log('Server Env Check - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
  console.log('Server Env Check - Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <ThemeProvider>
            <MainLayout>{children}</MainLayout>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
