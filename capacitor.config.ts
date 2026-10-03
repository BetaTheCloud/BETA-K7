import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tr.edu.kilis.k7au',
  appName: 'K7AÜ',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  },
  plugins: {}
};

export default config;
