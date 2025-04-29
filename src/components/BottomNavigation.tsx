
import { Home, Info, Calendar, Mail, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const BottomNavigation = () => {
  const location = useLocation();
  const { session } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/', icon: <Home className="h-5 w-5" />, label: 'Home' },
    { path: '/about', icon: <Info className="h-5 w-5" />, label: 'About' },
    { path: '/event', icon: <Calendar className="h-5 w-5" />, label: 'Events' },
    { path: '/enquiry', icon: <Mail className="h-5 w-5" />, label: 'Contact' },
    { path: '/profile', icon: <User className="h-5 w-5" />, label: 'Profile', requireAuth: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 shadow-lg z-50">
      {navItems.map((item) => {
        // Skip profile for non-authenticated users
        if (item.requireAuth && !session) return null;
        
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center ${
              isActive(item.path) 
                ? 'text-academy-primary' 
                : 'text-gray-500 hover:text-academy-primary'
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
