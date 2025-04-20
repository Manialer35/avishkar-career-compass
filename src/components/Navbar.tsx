
import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';
import Navigation from './Navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="w-full bg-academy-primary text-white py-4 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-white">Avishkar</span>
          <span className="text-academy-red"> Career Academy</span>
        </h1>
        
        <div className="flex items-center gap-4">
          {session && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-academy-red"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
          
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-academy-red"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <Navigation onNavigate={() => setIsOpen(false)} />
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
