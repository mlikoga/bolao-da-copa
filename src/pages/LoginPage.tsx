import { FirebaseError } from 'firebase/app';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

type EmailMode = 'sign-in' | 'sign-up';

type LoginAction = 'email' | 'google';

const firebaseAuthMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Este e-mail já está cadastrado. Entre com sua senha.',
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/operation-not-allowed': 'Login por e-mail e senha ainda não foi habilitado no Firebase Authentication.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/weak-password': 'Use uma senha com pelo menos 6 caracteres.',
  'auth/wrong-password': 'E-mail ou senha inválidos.'
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return firebaseAuthMessages[error.code] ?? 'Não foi possível autenticar. Tente novamente.';
  }

  return 'Não foi possível autenticar. Tente novamente.';
}

export default function LoginPage() {
  const { status, createAccountWithEmail, signInWithEmail, signInWithGoogle } = useAuth();
  const location = useLocation();
  const [emailMode, setEmailMode] = useState<EmailMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<LoginAction | null>(null);
  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';
  const isSubmitting = submittingAction !== null || status === 'loading';
  const emailSubmitLabel = emailMode === 'sign-in' ? 'Entrar com e-mail' : 'Criar conta com e-mail';

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittingAction('email');
    setErrorMessage(null);

    try {
      const credentials = { email: email.trim(), password };

      if (emailMode === 'sign-in') {
        await signInWithEmail(credentials);
      } else {
        await createAccountWithEmail(credentials);
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmittingAction('google');
    setErrorMessage(null);

    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setSubmittingAction(null);
    }
  };

  const toggleEmailMode = () => {
    setEmailMode((currentMode) => (currentMode === 'sign-in' ? 'sign-up' : 'sign-in'));
    setErrorMessage(null);
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

        <form className="auth-form" onSubmit={handleEmailSubmit}>
          <label>
            E-mail
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              autoComplete={emailMode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>
          <button type="submit" disabled={isSubmitting}>
            {submittingAction === 'email' ? 'Enviando...' : emailSubmitLabel}
          </button>
        </form>

        <button type="button" className="link-button" onClick={toggleEmailMode} disabled={isSubmitting}>
          {emailMode === 'sign-in' ? 'Criar uma conta com e-mail' : 'Já tenho conta com e-mail'}
        </button>

        <div className="auth-divider" role="separator">
          <span>ou</span>
        </div>

        <button type="button" className="secondary-button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
          {submittingAction === 'google' ? 'Entrando...' : 'Entrar com Google'}
        </button>
        {status === 'loading' && <p className="helper-text">Verificando sessão...</p>}
        {errorMessage && <p className="error-text">{errorMessage}</p>}
      </section>
    </main>
  );
}
