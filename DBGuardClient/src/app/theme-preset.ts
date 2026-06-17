import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#D9F2FD',
      100: '#C6EBFD',
      200: '#9EDEFB',
      300: '#77D1F9',
      400: '#50C3F8',
      500: '#29B6F6',  // main primary
      600: '#099BDE',
      700: '#0776A8',
      800: '#055072',
      900: '#032A3C',
      950: '#011721',
    }
    // colorScheme: {
    //   light: {
    //     surface: {
    //       0:   '#ffffff',
    //       50:  '#f8f9fa',
    //       100: '#f1f3f5',
    //       200: '#e9ecef',
    //       300: '#dee2e6',
    //       400: '#ced4da',
    //       500: '#adb5bd',
    //       600: '#868e96',
    //       700: '#495057',
    //       800: '#343a40',
    //       900: '#212529',
    //       950: '#0d1117',
    //     }
    //   },
    //   dark: {
    //     surface: {
    //       0:   '#ffffff',
    //       50:  '#1e1e2e',
    //       100: '#181825',
    //       // ...
    //     }
    //   }
    // }
  }
});