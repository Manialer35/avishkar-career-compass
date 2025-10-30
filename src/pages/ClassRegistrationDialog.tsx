import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Users, Clock, X } from 'lucide-react';

// Component for free class registration
const ClassRegistrationDialog = ({ isOpen, onClose, classItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here you would typically send the registration data to your backend
    // For this example, we'll just simulate a successful registration
    alert('Registration successful! You will receive a confirmation email shortly.');
    handleClose();
  };
  
  // Reset form when dialog closes
  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    onClose();
  };
  
  if (!classItem) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Register for Free Class</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-semibold text-academy-primary">{classItem.title}</h3>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {new Date(classItem.date).toLocaleDateString('en-IN', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {new Date(classItem.date).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit', hour12: true
                  })} ({classItem.duration} mins)
                </span>
              </div>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-600">{classItem.instructor}</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="reg-name">Full Name</Label>
              <Input
                id="reg-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="reg-email">Email Address</Label>
              <Input
                id="reg-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="reg-phone">Phone Number</Label>
              <Input
                id="reg-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-academy-primary hover:bg-academy-primary/90"
            >
              Register Now
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassRegistrationDialog;
