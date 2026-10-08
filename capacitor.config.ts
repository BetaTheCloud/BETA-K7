import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tr.edu.kilis.k7au',
  appName: 'K7AÜ',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      '*.onrender.com',
      'beta-k7.onrender.com',
      '*.kilis.edu.tr',
      'kilis.edu.tr',
      'api.open-meteo.com'
    ]
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
