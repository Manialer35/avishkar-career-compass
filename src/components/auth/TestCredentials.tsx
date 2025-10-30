
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, User } from 'lucide-react';

const TestCredentials = () => {
  return (
    <Card className="w-full max-w-md mx-auto mt-6 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
          <Eye className="h-5 w-5" />
          Test Account
          <Badge variant="secondary" className="ml-auto">Demo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">Email:</span>
          </div>
          <div className="bg-white px-3 py-2 rounded border text-sm font-mono">
            test@aavishkar.academy
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-gray-700">Password:</span>
          </div>
          <div className="bg-white px-3 py-2 rounded border text-sm font-mono">
            test123456
          </div>
        </div>
        
        <div className="text-xs text-gray-600 mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <strong>Note:</strong> This is a demo account for testing purposes. Use these credentials to explore the application features.
        </div>
      </CardContent>
    </Card>
  );
};

export default TestCredentials;
