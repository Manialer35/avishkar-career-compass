
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, User, Settings, Mail, Phone, FileText, Lock, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/profile` }
      );
      if (error) throw error;
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-academy-primary mb-6">Your Profile</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account information here
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateProfile}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    readOnly
                    disabled
                  />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="bg-academy-primary hover:bg-academy-primary/90"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your security settings and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Password Management</h3>
                <p className="text-sm text-gray-500">
                  Update your password to keep your account secure
                </p>
                <Button 
                  onClick={handlePasswordReset}
                  variant="outline"
                >
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>App Settings</CardTitle>
              <CardDescription>
                Manage your application preferences and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Policy Links Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Legal & Policies</h3>
                  
                  <div className="space-y-3">
                    <Link 
                      to="/terms-conditions" 
                      className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-5 w-5 text-academy-primary mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Terms and Conditions</h4>
                        <p className="text-sm text-gray-500">View our terms of service</p>
                      </div>
                    </Link>

                    <Link 
                      to="/privacy-policy" 
                      className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Lock className="h-5 w-5 text-academy-primary mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Privacy Policy</h4>
                        <p className="text-sm text-gray-500">Learn how we protect your data</p>
                      </div>
                    </Link>

                    <Link 
                      to="/refund-policy" 
                      className="flex items-center p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="h-5 w-5 text-academy-primary mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Refund & Cancellation Policy</h4>
                        <p className="text-sm text-gray-500">View our refund and cancellation terms</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
