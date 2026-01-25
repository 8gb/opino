import './globals.css';
import { Providers } from './providers';
import MainLayout from '../components/MainLayout';

export const metadata = {
  title: 'opino',
  description: 'Opino App',
}

export default function RootLayout({ children }) {
  console.log('Server Env Check - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
  console.log('Server Env Check - Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');
  return (
    <html lang="en">
      <body>
        <Providers>
           <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  )
}
