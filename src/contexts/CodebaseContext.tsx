"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * @file CodebaseContext.tsx
 * @description This file serves two purposes:
 * 1.  **Developer's Guide:** Provides a high-level overview of the project's architecture,
 *     tech stack, and data flow for anyone contributing to the codebase.
 * 2.  **React Context:** A global state management context for application-wide settings.
 *
 * ===================================================================================
 *                            PROJECT DOCUMENTATION
 * ===================================================================================
 *
 * ### 1. Project Overview
 * - **App Name:** embe
 * - **Purpose:** A web application to discover and review food spots, initially focused on Đà Lạt.
 * - **Core Features:** Browse food listings, view details, user authentication (login),
 *   and user-specific lists (favorites, wishlist, visited).
 *
 * ### 2. Tech Stack
 * - **Framework:** React (with Vite)
 * - **Language:** TypeScript
 * - **Styling:** Tailwind CSS with shadcn/ui for components.
 * - **Routing:** React Router DOM (`react-router-dom`)
 * - **Backend & Auth:** Supabase (handles user authentication and database).
 * - **UI Components:** Custom components are in `src/components`.
 * - **Notifications:** `sonner` for toast notifications.
 *
 * ### 3. Project Structure
 * - `src/components`: Reusable UI components (e.g., Layout, Card, Button).
 * - `src/pages`: Top-level page components that correspond to routes (e.g., HomePage, DetailPage).
 * - `src/data`: Contains static data, primarily the JSON files for food listings (`monan`).
 * - `src/contexts`: Global React contexts for state management (e.g., this file).
 * - `src/lib`: Utility functions, Supabase client configuration (`supabase.ts`).
 * - `src/hooks`: Custom React hooks.
 * - `src/types`: TypeScript type definitions.
 *
 * ### 4. Data Flow
 * - **Food Data:** Currently stored as static JSON files in `src/data/monan`. Each file represents one food spot.
 * - **User Data:** Managed by Supabase. The `SessionContextProvider` wraps the app to provide
 *   authentication state (user session) to all components.
 * - **State Management:**
 *   - **Local State:** Managed within individual components using `useState` and `useEffect`.
 *   - **Global State:** Managed via React Context for things like user session and app-wide settings.
 *
 * ===================================================================================
 *                            REACT CONTEXT IMPLEMENTATION
 * ===================================================================================
 */

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