import { Link, useLocation } from 'react-router'
import { bottomNavItems, isActiveRoute } from '@/config/navigation'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const active = isActiveRoute(location.pathname, item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] px-3 py-2 rounded-lg transition-all duration-300 touch-manipulation',
                active
                  ? 'text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-gray-500 hover:text-white active:bg-white/10 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
