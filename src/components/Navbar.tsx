import { useState, useEffect, useRef } from 'react';
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
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAdmin = userRole?.role === 'admin';

  // Use the uploaded logo
  const logoUrl = "/lovable-uploads/c735577b-85a5-4e24-a5fc-de37dc760f8b.png";

  console.log("Navbar - userRole:", userRole);
  console.log("Navbar - isAdmin:", isAdmin);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ensure the button remains visible
  useEffect(() => {
    if (buttonRef.current) {
      // Force the button to be visible
      buttonRef.current.style.display = 'flex';
      buttonRef.current.style.opacity = '1';
      
      // Clear any potential timeouts that might hide the button
      const buttonElement = buttonRef.current;
      const originalDisplay = buttonElement.style.display;
      const originalOpacity = buttonElement.style.opacity;
      
      // Override any animations or transitions that might affect visibility
      buttonElement.style.transition = 'none';
      buttonElement.style.animation = 'none';
      
      // Create a mutation observer to detect style changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style' || 
              mutation.attributeName === 'class') {
            // Restore visibility if changed
            if (buttonElement.style.display === 'none' || 
                buttonElement.style.opacity === '0' ||
                buttonElement.style.visibility === 'hidden') {
              buttonElement.style.display = originalDisplay || 'flex';
              buttonElement.style.opacity = originalOpacity || '1';
              buttonElement.style.visibility = 'visible';
            }
          }
        });
      });
      
      observer.observe(buttonElement, { 
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      return () => observer.disconnect();
    }
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
          <div className="flex items-center gap-3">
            <img
              src={logoUrl}
              alt="Aavishkar Academy Logo"
              className="w-12 h-8 object-contain"
              onError={(e) => {
                console.log("Logo failed to load");
              }}
            />
            <h1 className="text-xl font-bold">
              <span className="text-white">Aavishkar</span>
              <span className="text-blue-300"> Career Academy</span>
            </h1>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-academy-primary text-white py-4 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Aavishkar Academy Logo"
            className="w-12 h-8 object-contain"
            onError={(e) => {
              console.log("Logo failed to load");
            }}
          />
          <h1 className="text-xl font-bold">
            <span className="text-white">Aavishkar</span>
            <span className="text-blue-300"> Career Academy</span>
          </h1>
          {isAdmin && !isMobile && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md">
              Admin
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-blue-600 text-white hover:bg-blue-700 border-none"
              onClick={() => navigate('/admin')}
            >
              <ShieldAlert className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          
          {session && (
            <div 
              className="relative inline-block" 
              style={{ opacity: 1, visibility: 'visible' }}
            >
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    ref={buttonRef}
                    variant="secondary" 
                    size="sm"
                    className="text-white hover:bg-pink-600 bg-pink-500 rounded-full w-10 h-10 flex items-center justify-center shadow-md !opacity-100 !visible"
                    style={{ 
                      opacity: 1, 
                      visibility: 'visible', 
                      display: 'flex',
                      animation: 'none',
                      transition: 'none'
                    }}
                  >
                    {isAdmin ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    navigate('/profile');
                  }} 
                  className="cursor-pointer flex items-center"
                >
                  <User className="h-4 w-4 mr-2" /> My Profile
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      navigate('/admin');
                    }} className="cursor-pointer flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-2" /> Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      navigate('/admin/users');
                    }} className="cursor-pointer flex items-center">
                      <Users className="h-4 w-4 mr-2" /> Manage Users
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }} 
                  className="cursor-pointer text-blue-600"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
