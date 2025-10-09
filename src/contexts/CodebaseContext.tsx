"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Define the type for the context state
interface CodebaseContextType {
  // This is an example state. You can add any state or functions 
  // you want to share across your application.
  appName: string;
  setAppName: (name: string) => void;
}

// 2. Create the context with a default undefined value
const CodebaseContext = createContext<CodebaseContextType | undefined>(undefined);

// 3. Create the Provider component
interface CodebaseProviderProps {
  children: ReactNode;
}

export const CodebaseProvider = ({ children }: CodebaseProviderProps) => {
  const [appName, setAppName] = useState('embe'); // Example state

  const value = {
    appName,
    setAppName,
  };

  return (
    <CodebaseContext.Provider value={value}>
      {children}
    </CodebaseContext.Provider>
  );
};

// 4. Create a custom hook for easy consumption in other components
export const useCodebase = () => {
  const context = useContext(CodebaseContext);
  if (context === undefined) {
    throw new Error('useCodebase must be used within a CodebaseProvider');
  }
  return context;
};