import { Navigate, Route, Routes } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';
import MatchesPage from './pages/MatchesPage';
import PoolsPage from './pages/PoolsPage';
import ProfilePage from './pages/ProfilePage';
import RankingPage from './pages/RankingPage';

export default function App() {
  return (
    <AuthGate>
      <Layout>
        <Routes>
          <Route path="/" element={<PoolsPage />} />
          <Route path="/jogos" element={<MatchesPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </AuthGate>
  );
}
