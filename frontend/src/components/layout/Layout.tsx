import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { Navbar } from './Navbar'

export function Layout() {
  const { isAuthenticated } = useAuthStore()

  // AuthSync has already synced Flask session with Zustand store
  // So we just need to check the Zustand store state
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If logged in but no broker selected, allow dashboard without broker
  // (testing mode - broker connection disabled)

  return (
    <SocketProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6 flex-1">
          <Outlet />
        </main>
        <Footer className="hidden md:block" />
        <MobileBottomNav />
      </div>
    </SocketProvider>
  )
}

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
