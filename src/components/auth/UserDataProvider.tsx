"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { initialState, useRoadCube } from "@/lib/store";
import { startSync } from "@/lib/sync";
import type { UserData } from "@/lib/user-data";

/**
 * Coloca os dados do usuário no store e liga a sincronização. Fica em um
 * efeito de propósito: efeitos não rodam no servidor, onde o store é global.
 */
export function UserDataProvider({
  userId,
  email,
  initial,
  children,
}: {
  userId: string;
  email: string | null;
  initial: UserData;
  children: React.ReactNode;
}) {
  useEffect(() => {
    useRoadCube.setState({ ...initial, email, ready: true });
    const stop = startSync(createClient(), userId);
    return () => {
      stop();
      useRoadCube.setState(initialState);
    };
  }, [userId, email, initial]);

  return children;
}
