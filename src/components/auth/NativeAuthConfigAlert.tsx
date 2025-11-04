import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface NativeAuthConfigAlertProps {
  packageId: string;
}

const NativeAuthConfigAlert: React.FC<NativeAuthConfigAlertProps> = ({ packageId }) => {
  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <ShieldAlert className="h-4 w-4 text-yellow-700" />
      <AlertTitle className="text-yellow-900">Android app not authorized for Phone OTP</AlertTitle>
      <AlertDescription className="text-yellow-800 space-y-2">
        <p>
          Firebase rejected the request with <code className="px-1 rounded bg-yellow-100">auth/app-not-authorized</code>.
          This happens when the Android app fingerprints are missing in Firebase.
        </p>
        <div className="mt-2">
          <p className="font-medium">Fix in Firebase Console:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Open Project settings → Your apps → Android.</li>
            <li>Ensure the package name matches: <code className="bg-yellow-100 px-1 rounded">{packageId}</code></li>
            <li>Add SHA-1 and SHA-256 for BOTH debug and release builds.</li>
            <li>Download the updated <code>google-services.json</code> and replace <code>android/app/google-services.json</code>.</li>
            <li>Rebuild the app: <code>npm run build</code> then <code>npx cap sync android</code> and run again.</li>
          </ol>
        </div>
        <div className="mt-3 p-2 bg-white border border-yellow-200 rounded text-xs">
          <p className="font-mono"># Release keystore (in repo)</p>
          <pre className="whitespace-pre-wrap">{`keytool -list -v \
 -keystore android/app/avishkar-release-key.keystore \
 -alias avishkar \
 -storepass MKhot@123 -keypass MKhot@123`}</pre>
          <p className="mt-2 font-mono"># Debug keystore</p>
          <pre className="whitespace-pre-wrap">{`keytool -list -v \
 -alias androiddebugkey \
 -keystore ~/.android/debug.keystore \
 -storepass android -keypass android`}</pre>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default NativeAuthConfigAlert;
