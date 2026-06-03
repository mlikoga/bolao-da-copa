import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { auth } from '../lib/firebase';

export default function AuthGate({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <p>Carregando sessão...</p>;

  if (!user) {
    return (
      <div className="center-box">
        <h2>Entre para participar do bolão</h2>
        <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>Entrar com Google</button>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <span>{user.displayName}</span>
        <button onClick={() => signOut(auth)}>Sair</button>
      </div>
      {children}
    </>
  );
}
