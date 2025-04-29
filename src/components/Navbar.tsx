
import { useState, useEffect } from 'react';
import { LogOut, User, Users, ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const { session, user, userRole, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = userRole?.role === 'admin';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <header className="w-full bg-academy-primary text-white py-4 px-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="https://via.placeholder.com/40x40/ffffff/1e3a8a?text=A"
              alt="Avishkar Academy Logo"
              className="w-10 h-10 rounded-md"
            />
            <h1 className="text-xl font-bold">
              <span className="text-white">Avishkar</span>
              <span className="text-academy-red"> Career Academy</span>
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-academy-primary text-white py-4 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="https://via.placeholder.com/40x40/ffffff/1e3a8a?text=A"
            alt="Avishkar Academy Logo"
            className="w-10 h-10 rounded-md"
          />
          <h1 className="text-xl font-bold">
            <span className="text-white">Avishkar</span>
            <span className="text-academy-red"> Career Academy</span>
          </h1>
          {isAdmin && !isMobile && (
            <span className="ml-2 px-2 py-0.5 bg-academy-red text-white text-xs rounded-md">
              Admin
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-academy-red text-white hover:bg-academy-red/90 border-none mr-2"
              onClick={() => navigate('/admin')}
            >
              <ShieldAlert className="h-4 w-4 mr-1" /> Admin Panel
            </Button>
          )}
          
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-academy-primary/80"
                >
                  {isAdmin ? (
                    <ShieldAlert className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex items-center">
                    <User className="h-4 w-4 mr-2" /> My Profile
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <ShieldAlert className="h-4 w-4 mr-2" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/users" className="cursor-pointer flex items-center">
                        <Users className="h-4 w-4 mr-2" /> Manage Users
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
