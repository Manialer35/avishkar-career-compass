
import { Home, Info, Calendar, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const { session } = useAuth();
  
  const navItems = [
    { label: 'Home', icon: <Home className="mr-2 h-5 w-5" />, path: '/' },
    { label: 'About', icon: <Info className="mr-2 h-5 w-5" />, path: '/about' },
    { label: 'Police Bharti Special Event', icon: <Calendar className="mr-2 h-5 w-5" />, path: '/event' },
    { label: 'Enquiry', icon: <Mail className="mr-2 h-5 w-5" />, path: '/enquiry' },
  ];

  return (
    <nav className="p-6 bg-white">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-academy-primary">Avishkar Career Academy</h2>
        <p className="text-sm text-gray-500">Empowering Future Competitors</p>
      </div>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link
              to={item.path}
              className="flex items-center p-3 rounded-md text-gray-700 hover:bg-academy-light hover:text-academy-primary transition-colors"
              onClick={onNavigate}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        
        {session && (
          <li>
            <Link
              to="/profile"
              className="flex items-center p-3 rounded-md text-gray-700 hover:bg-academy-light hover:text-academy-primary transition-colors"
              onClick={onNavigate}
            >
              <User className="mr-2 h-5 w-5" />
              <span>My Profile</span>
            </Link>
          </li>
        )}
      </ul>
      
      <div className="mt-8 pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">Connect with us</h3>
        <div className="flex space-x-4">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-academy-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-academy-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-academy-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
