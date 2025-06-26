
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.edaf6c8a99f44154a62e5ea9345f08e9',
  appName: 'aavishkar-career-compass',
  webDir: 'dist',
  server: {
    url: 'https://edaf6c8a-99f4-4154-a62e-5ea9345f08e9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: undefined,
    }
  }
};

export default config;
