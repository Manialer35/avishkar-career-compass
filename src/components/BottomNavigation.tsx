
import { Book, Calendar, Home, Info, Mail, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/home') return true;
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-between max-w-screen-xl mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center py-2 px-1",
              isActive
                ? "text-academy-primary"
                : "text-gray-500 hover:text-academy-primary"
            )
          }
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/events"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center py-2 px-1",
              isActive
                ? "text-academy-primary"
                : "text-gray-500 hover:text-academy-primary"
            )
          }
        >
          <Calendar className="h-5 w-5" />
          <span className="text-xs mt-1">Classes</span>
        </NavLink>

        <NavLink
          to="/study-materials"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center py-2 px-1",
              isActive
                ? "text-academy-primary"
                : "text-gray-500 hover:text-academy-primary"
            )
          }
        >
          <Book className="h-5 w-5" />
          <span className="text-xs mt-1">Study</span>
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center py-2 px-1",
              isActive
                ? "text-academy-primary"
                : "text-gray-500 hover:text-academy-primary"
            )
          }
        >
          <Info className="h-5 w-5" />
          <span className="text-xs mt-1">About</span>
        </NavLink>

        <NavLink
          to="/enquiry"
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center py-2 px-1",
              isActive
                ? "text-academy-primary"
                : "text-gray-500 hover:text-academy-primary"
            )
          }
        >
          <Mail className="h-5 w-5" />
          <span className="text-xs mt-1">Enquiry</span>
        </NavLink>

        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center py-2 px-1",
                isActive
                  ? "text-academy-primary"
                  : "text-gray-500 hover:text-academy-primary"
              )
            }
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;
