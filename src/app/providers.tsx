import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

// Wrap your app in global providers here (e.g. Redux Provider, ThemeProvider)
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};
