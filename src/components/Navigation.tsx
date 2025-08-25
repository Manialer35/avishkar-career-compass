import { Home, Info, Calendar, Mail, User, Instagram, Facebook, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Badge } from './ui/badge';

interface NavigationProps {
  onNavigate?: () => void;
}

const Navigation = ({ onNavigate }: NavigationProps) => {
  const { user } = useAuth();
  
  const navItems = [
    { label: 'Home', icon: <Home className="mr-2 h-5 w-5" />, path: '/' },
    { label: 'About', icon: <Info className="mr-2 h-5 w-5" />, path: '/about' },
    { label: 'Police Bharti Special Event', icon: <Calendar className="mr-2 h-5 w-5" />, path: '/event' },
    { label: 'Enquiry', icon: <Mail className="mr-2 h-5 w-5" />, path: '/enquiry' },
  ];


  const socialLinks = [
    { 
      name: 'Instagram', 
      icon: <Instagram className="h-5 w-5 transition-colors duration-300" />, 
      url: 'https://www.instagram.com/aavishkar_career_academy?igsh=aTNmODF6ZjJhZnJy',
      color: 'hover:text-pink-600' 
    },
    { 
      name: 'Facebook', 
      icon: <Facebook className="h-5 w-5 transition-colors duration-300" />, 
      url: 'https://www.facebook.com/share/19RWgCWtVW/',
      color: 'hover:text-blue-600' 
    },
    { 
      name: 'WhatsApp', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-colors duration-300"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>, 
      url: 'https://wa.me/919049137731',
      color: 'hover:text-green-500' 
    },
    { 
      name: 'Telegram', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 transition-colors duration-300"><path d="M21.73 2.27a2 2 0 0 0-2.83 0l-.06.06a.8.8 0 0 1-.86.17A10 10 0 1 0 21.93 16.4a.8.8 0 0 1 .17-.86l.06-.06a2 2 0 0 0 0-2.83L21.73 12"></path><path d="m12.5 12.5 5-5"></path><path d="M16 8h0v0"></path><circle cx="12" cy="16" r="1"></circle></svg>, 
      url: 'https://t.me/avishkar26',
      color: 'hover:text-sky-500' 
    }
  ];

  return (
    <nav className="p-6 bg-white">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-accent animate-fade-in">Avishkar Career Academy</h2>
        <p className="text-sm text-gray-500">Empowering Future Competitors</p>
      </div>

      <ul className="space-y-2">
        {navItems.map((item, index) => (
          <li key={item.label} style={{animationDelay: `${index * 0.1}s`}} className="animate-fade-in">
            <Link
              to={item.path}
              className="flex items-center p-3 rounded-md text-gray-700 hover:bg-accent/10 hover:text-accent transition-colors"
              onClick={onNavigate}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
        
        {user && (
          <li className="animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Link
              to="/profile"
              className="flex items-center p-3 rounded-md text-gray-700 hover:bg-accent/10 hover:text-accent transition-colors"
              onClick={onNavigate}
            >
              <User className="mr-2 h-5 w-5" />
              <span>My Profile</span>
            </Link>
          </li>
        )}
      </ul>
      
      <div className="mt-8 pt-4 border-t">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Connect with us</h3>
        <div className="flex flex-col space-y-4">
          {socialLinks.map((social, index) => (
            <a 
              key={social.name}
              href={social.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center text-gray-600 transition-colors duration-300 ${social.color}`}
              style={{animationDelay: `${index * 0.1 + 0.5}s`}}
            >
              {social.icon}
              <span className="ml-2">{social.name}</span>
            </a>
          ))}
          
          <div className="mt-4 pt-4 border-t animate-fade-in" style={{animationDelay: '0.8s'}}>
            <p className="text-sm text-gray-500">
              Contact Us: <a href="tel:+919049137731" className="text-accent hover:underline">+91 9049137731</a>
              <br />
              <a href="tel:+919890555432" className="text-accent hover:underline">+91 9890555432</a>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Email: <a href="mailto:khot.md@gmail.com" className="text-accent hover:underline">khot.md@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
