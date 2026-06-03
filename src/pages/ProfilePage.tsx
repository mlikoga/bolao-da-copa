import { useAuth } from '../lib/auth';

export default function ProfilePage() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? 'Participante';
  const email = user?.email ?? 'E-mail não informado';

  return (
    <section>
      <h2>Perfil</h2>
      <p>Gerencie suas informações e notificações.</p>
      <div className="card profile-card">
        {user?.photoURL && <img src={user.photoURL} alt="Foto do perfil" />}
        <div>
          <strong>{displayName}</strong>
          <p>{email}</p>
        </div>
      </div>
    </section>
  );
}
