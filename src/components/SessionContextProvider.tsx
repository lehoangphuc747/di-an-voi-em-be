"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserLists } from '@/types';

export interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  userLists: UserLists;
  setUserLists: React.Dispatch<React.SetStateAction<UserLists>>;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionContextProvider = ({ children }: SessionProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [userLists, setUserLists] = useState<UserLists>({
    favorites: [],
    wishlist: [],
    visited: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event !== 'INITIAL_SESSION') {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserLists = async (userId: string) => {
      try {
        const [favoritesRes, wishlistRes, visitedRes] = await Promise.all([
          supabase.from('favorites').select('mon_an_id').eq('user_id', userId),
          supabase.from('wishlist').select('mon_an_id').eq('user_id', userId),
          supabase.from('visited').select('mon_an_id').eq('user_id', userId),
        ]);

        if (favoritesRes.error) throw favoritesRes.error;
        if (wishlistRes.error) throw wishlistRes.error;
        if (visitedRes.error) throw visitedRes.error;

        setUserLists({
          favorites: favoritesRes.data.map(item => item.mon_an_id),
          wishlist: wishlistRes.data.map(item => item.mon_an_id),
          visited: visitedRes.data.map(item => item.mon_an_id),
        });
      } catch (error) {
        console.error('Failed to fetch user lists:', error);
      }
    };

    if (session?.user) {
      fetchUserLists(session.user.id);
    } else {
      setUserLists({ favorites: [], wishlist: [], visited: [] });
    }
  }, [session]);

  const value = {
    session,
    user: session?.user ?? null,
    isLoading,
    userLists,
    setUserLists,
  };

  return (
    <SessionContext.Provider value={value}>
      {!isLoading && children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};