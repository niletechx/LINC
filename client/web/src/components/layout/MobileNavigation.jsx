import { Link, useLocation } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';

export default function MobileNavigation() {
  const location = useLocation();
  const { conversations } = useChatStore();

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread || 0), 0);

  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/search', label: 'Search', icon: '🔍' },
    { path: '/ai', label: 'LINC AI', icon: '✨', highlight: true },
    { path: '/bookings', label: 'Bookings', icon: '📅' },
    { path: '/messages', label: 'Chat', icon: '💬', badge: totalUnread },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] pb-safe pt-2 px-2 flex justify-between items-end z-50 h-[65px]">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        
        if (item.highlight) {
          return (
            <Link key={item.path} to={item.path} className="flex flex-col items-center flex-1 pb-1">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#7EC8E3] to-[#0284C7] shadow-[0_4px_10px_rgba(2,132,199,0.3)] flex justify-center items-center transform -translate-y-2">
                <span className="text-white text-[20px]">{item.icon}</span>
              </div>
              <span className={`text-[10px] font-extrabold -mt-1 ${isActive ? 'text-[#0284C7]' : 'text-[#64748B]'}`}>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link key={item.path} to={item.path} className="flex flex-col items-center flex-1 pb-1">
            <div className="relative mb-1">
              <span className={`text-[22px] ${isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-60'}`}>{item.icon}</span>
              {item.badge > 0 && (
                <div className="absolute -top-1 -right-2 bg-[#EF4444] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex justify-center items-center border border-white">
                  {item.badge}
                </div>
              )}
            </div>
            <span className={`text-[10px] ${isActive ? 'font-extrabold text-[#0F172A]' : 'font-semibold text-[#64748B]'}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
