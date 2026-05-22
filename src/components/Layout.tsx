import { Link, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const tabs = [
  { to: '/', label: 'Bolões' },
  { to: '/jogos', label: 'Jogos' },
  { to: '/ranking', label: 'Ranking' },
  { to: '/perfil', label: 'Perfil' }
];

export default function Layout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header>
        <h1>Bolão da Copa</h1>
      </header>
      <main>{children}</main>
      <nav>
        {tabs.map((tab) => (
          <Link key={tab.to} to={tab.to} className={location.pathname === tab.to ? 'active' : ''}>
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
