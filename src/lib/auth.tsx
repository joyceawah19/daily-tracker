
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log("SIGNUP DATA:", data);
  console.log("SIGNUP ERROR:", error);

  if (error) {
    return { error };
  }

  alert("Signup successful! Check your email.");

  return { error: null };
};

  // const signUp = async (email: string, password: string) => {
  //   // 1. Create the Auth user
  //   const { data, error: authError } = await supabase.auth.signUp({ email, password });
    
  //   if (authError) return { error: authError };

  //   // 2. Save data to 'form-data' table if signup successful
  //   // if (data.user) {
  //   //   const { error: dbError } = await supabase
  //   //     .from('form-data')
  //   //     .insert([{ 
  //   //         id: data.user.id, 
  //   //         email: email, 
  //   //     }]);
      
  //   //   if (dbError) console.error("Database sync error:", dbError.message);
  //   // }

  //   return { error: null };
  // };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};