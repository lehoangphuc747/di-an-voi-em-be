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
 * ### 5. AI Content Generation Rules
 * **Objective:** To process raw text submitted by users about a food spot and convert it into a
 * standardized, structured JSON object that conforms to the `MonAn` type.
 *
 * **Input:** A block of raw, unstructured text from a user.
 *   - *Example Input:* "quán bánh căn nhà chung ở số 1 nhà chung đà lạt ngon lắm, giá khoảng 50k một phần. quán bán buổi sáng thôi. nó là đồ ăn vặt á. nên thử nha"
 *
 * **Output:** A structured JSON object matching the `MonAn` interface.
 *
 * **Standardization Rules:**
 * 1.  **Tên (Name):**
 *     - Must be proper Title Case (e.g., "Bánh Căn Nhà Chung" instead of "bánh căn nhà chung").
 *     - If the name is generic (e.g., "Quán bún bò"), combine it with the street name (e.g., "Bún Bò Phan Đình Phùng").
 * 2.  **Địa chỉ (Address):**
 *     - Standardize to the format: `Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố`.
 *     - Always include "Đà Lạt" as the city and "Lâm Đồng" as the province if not specified otherwise.
 *     - Attempt to verify the address's plausibility.
 * 3.  **Mô tả (Description):**
 *     - Write in an objective, descriptive, and helpful tone.
 *     - The first sentence should be a general summary of the food spot.
 *     - Mention key dishes, specialties, price range, and suitable times to visit (e.g., breakfast, lunch, dinner).
 *     - Keep it concise, around 2-4 sentences.
 * 4.  **Tags:**
 *     - Generate 3-5 relevant, lowercase tags.
 *     - Tags should include the main dish (e.g., "bánh căn"), meal type ("bữa sáng"), and characteristics ("đặc sản đà lạt", "giá rẻ").
 *     - Do not use `#`.
 * 5.  **Loại Món (Category - `loaiIds`):**
 *     - Analyze the user's text to map it to one or more existing category IDs from `loaimon.json`.
 *     - Example mapping: "ăn no", "bữa chính" -> `an-no`; "ăn vặt", "ăn xế" -> `an-vat`; "cà phê", "trà sữa" -> `ca-phe-giai-khat`.
 * 6.  **Giá (Price - `giaMin`, `giaMax`):**
 *     - Extract any numbers mentioned with currency units (k, vnd, ngàn).
 *     - If a single price is mentioned, set both `giaMin` and `giaMax` to that value.
 *     - If a range is mentioned, extract it.
 *
 * **AI Processing Workflow:**
 * 1.  **Analyze Input:** Read the user's raw text.
 * 2.  **Entity Extraction:** Identify and extract key pieces of information (Tên, Địa chỉ, Món ăn, Giá cả, Thời gian, etc.).
 * 3.  **Field Standardization:** Apply the rules above to clean and format each extracted entity.
 * 4.  **Tag & Category Generation:** Based on the context, generate relevant tags and map to `loaiIds`.
 * 5.  **Description Synthesis:** Write a concise `moTa` based on the gathered information.
 * 6.  **JSON Assembly:** Construct the final JSON object according to the `MonAn` type.
 *
 * ===================================================================================
 *                            REACT CONTEXT IMPLEMENTATION
 * ===================================================================================
 */

// ... (The rest of the React Context code remains unchanged)

interface CodebaseContextType {
  appName: string;
  setAppName: (name: string) => void;
}

const CodebaseContext = createContext<CodebaseContextType | undefined>(undefined);

interface CodebaseProviderProps {
  children: ReactNode;
}

export const CodebaseProvider = ({ children }: CodebaseProviderProps) => {
  const [appName, setAppName] = useState('embe');

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

export const useCodebase = () => {
  const context = useContext(CodebaseContext);
  if (context === undefined) {
    throw new Error('useCodebase must be used within a CodebaseProvider');
  }
  return context;
};