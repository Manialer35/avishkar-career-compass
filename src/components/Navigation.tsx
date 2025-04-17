
import { Home, Info, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
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
      </ul>
    </nav>
  );
};

export default Navigation;
