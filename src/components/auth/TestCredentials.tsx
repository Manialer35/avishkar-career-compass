
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Copy, User, Lock } from 'lucide-react';

const TestCredentials = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const testEmail = 'test@aavishkar.academy';
  const testPassword = 'test123456';

  const createTestUser = async () => {
    setIsCreating(true);
    try {
      await signUp(testEmail, testPassword);
      toast({
        title: 'Test user created',
        description: 'You can now use the test credentials to login',
      });
    } catch (error: any) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Test user already exists',
          description: 'You can use the test credentials to login',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error creating test user',
          description: error.message,
        });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${type} copied successfully`,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Test Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email:</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
              {testEmail}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(testEmail, 'Email')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password:</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 rounded text-sm">
              {testPassword}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(testPassword, 'Password')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={createTestUser} 
          disabled={isCreating}
          className="w-full"
        >
          <Lock className="h-4 w-4 mr-2" />
          {isCreating ? 'Creating...' : 'Create Test User'}
        </Button>

        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <strong>Note:</strong> Click "Create Test User" first, then use these credentials to login on the auth page.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCredentials;
