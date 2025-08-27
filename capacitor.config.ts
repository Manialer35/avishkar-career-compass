
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.edaf6c8a99f44154a62e5ea9345f08e9',
  appName: 'Aavishkar Academy',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'app/avishkar-release-key.keystore',
      keystorePassword: '',
      keystoreAlias: 'avishkar-key-alias',
      keystoreAliasPassword: '',
      signingType: 'apksigner',
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      showSpinner: false
    }
  }
};

export default config;
