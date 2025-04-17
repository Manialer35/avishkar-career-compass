
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from './ui/drawer';
import Navigation from './Navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-academy-primary text-white py-4 px-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-white">Avishkar</span>
          <span className="text-academy-red"> Career Academy</span>
        </h1>
        
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
    </header>
  );
};

export default Navbar;
