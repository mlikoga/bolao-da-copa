import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const tabs = [
  { to: '/', label: 'Bolões' },
  { to: '/jogos', label: 'Jogos' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/perfil', label: 'Perfil' }
];

export default function Layout() {
  const { user, signOutUser } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? 'Participante';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Bolão da Copa</p>
          <h1>Meu painel</h1>
        </div>
        <div className="session-summary">
          <span>{displayName}</span>
          <button type="button" className="ghost-button" onClick={signOutUser}>
            Sair
          </button>
        </div>
      </header>
      <main className="content-area">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Navegação principal">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => (isActive ? 'active' : undefined)} end={tab.to === '/'}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
