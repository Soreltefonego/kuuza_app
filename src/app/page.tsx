import { redirect } from 'next/navigation'

export default function Home() {
  // Rediriger directement vers la page de login
  redirect('/login')
}