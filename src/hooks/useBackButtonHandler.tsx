import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useLocation } from 'react-router-dom';

export const useBackButtonHandler = () => {
  const location = useLocation();

  useEffect(() => {
    let listenerHandle: any;

    const setupListener = async () => {
      listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
        // If we're on the home page, show exit confirmation
        if (location.pathname === '/' || location.pathname === '/auth') {
          const confirmExit = window.confirm('Do you want to exit the app?');
          if (confirmExit) {
            App.exitApp();
          }
        } else if (canGoBack) {
          // If we can go back in browser history, do that
          window.history.back();
        } else {
          // Otherwise show exit confirmation
          const confirmExit = window.confirm('Do you want to exit the app?');
          if (confirmExit) {
            App.exitApp();
          }
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [location.pathname]);
};

