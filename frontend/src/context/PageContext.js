import React, { createContext, useState } from 'react';

// Create the context
export const PageContext = createContext();

// Create a provider component
export const PageProvider = ({ children }) => {
  const [pageTitle, setPageTitle] = useState(null);

  return (
    <PageContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageContext.Provider>
  );
};
