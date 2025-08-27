import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DomainErrorAlertProps {
  currentDomain: string;
}

const DomainErrorAlert: React.FC<DomainErrorAlertProps> = ({ currentDomain }) => {
  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Domain Authorization Required</AlertTitle>
      <AlertDescription className="text-red-700 space-y-2">
        <p>
          The current domain <strong>{currentDomain}</strong> is not authorized for phone authentication.
        </p>
        <div className="mt-3">
          <p className="font-medium">To fix this issue:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Go to the <a 
              href="https://console.firebase.google.com/project/avishkarca-86013/authentication/settings" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Firebase Console Authentication Settings
            </a></li>
            <li>Navigate to the "Authorized domains" section</li>
            <li>Add this domain: <code className="bg-red-100 px-1 rounded">{currentDomain}</code></li>
            <li>Also add: <code className="bg-red-100 px-1 rounded">{window.location.origin}</code></li>
            <li>Save the changes and try again</li>
          </ol>
        </div>
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Changes may take a few minutes to take effect.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DomainErrorAlert;