import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { auth, googleProvider } from './firebase';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (sessionUser) => {
      setUser(sessionUser);
      setStatus(sessionUser ? 'authenticated' : 'anonymous');
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ status, user, signInWithGoogle, signOutUser }),
    [status, user, signInWithGoogle, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

export type { AuthStatus };
