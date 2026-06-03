import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function AuthGate() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Carregando sessão...</p>
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/entrar" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
