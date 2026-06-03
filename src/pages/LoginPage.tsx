import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export default function LoginPage() {
  const { status, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithGoogle();
    } catch {
      setErrorMessage('Não foi possível entrar com Google. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Bolão da Copa</p>
        <h1 id="login-title">Entre para participar do bolão</h1>
        <p>
          Faça login para acessar seus bolões, navegar pelos jogos e acompanhar o ranking em uma experiência
          mobile-first.
        </p>
        <button type="button" onClick={handleGoogleSignIn} disabled={submitting || status === 'loading'}>
          {submitting ? 'Entrando...' : 'Entrar com Google'}
        </button>
        {status === 'loading' && <p className="helper-text">Verificando sessão...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </section>
    </main>
  );
}
