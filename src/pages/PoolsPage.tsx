import { FirebaseError } from 'firebase/app';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPool, joinPoolByInviteCode, listPoolMembers, normalizeInviteCode, subscribeToUserPools } from '../lib/pools';
import type { Pool, PoolMember } from '../lib/types';
import { useAuth } from '../lib/auth';

type FormMode = 'create' | 'join' | null;

const roleLabels: Record<PoolMember['role'], string> = {
  owner: 'Dono',
  admin: 'Admin',
  member: 'Membro'
};

function getErrorMessage(error: unknown, action: 'create' | 'join' | 'load' = 'load') {
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      if (action === 'create') {
        return 'Não foi possível criar o bolão por falta de permissão. Atualize a página e tente novamente.';
      }

      if (action === 'join') {
        return 'Você não tem permissão para entrar nesse bolão. Confira o código e tente novamente.';
      }

      return 'Não foi possível carregar seus bolões por falta de permissão. Atualize a página e tente novamente.';
    }

    return 'Não foi possível sincronizar com o Firestore. Tente novamente.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível concluir a ação. Tente novamente.';
}

export default function PoolsPage() {
  const { user } = useAuth();
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [poolName, setPoolName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPool = useMemo(
    () => pools.find((pool) => pool.id === selectedPoolId) ?? pools[0] ?? null,
    [pools, selectedPoolId]
  );

  useEffect(() => {
    if (!user) {
      return undefined;
    }

    setLoadingPools(true);
    const unsubscribe = subscribeToUserPools(
      user,
      (nextPools) => {
        setPools(nextPools);
        setLoadingPools(false);
        setSelectedPoolId((currentPoolId) => {
          if (currentPoolId && nextPools.some((pool) => pool.id === currentPoolId)) {
            return currentPoolId;
          }

          return nextPools[0]?.id ?? null;
        });
      },
      (error) => {
        setErrorMessage(getErrorMessage(error, 'load'));
        setLoadingPools(false);
      }
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!selectedPool) {
      setMembers([]);
      return undefined;
    }

    let active = true;
    setLoadingMembers(true);

    listPoolMembers(selectedPool.id)
      .then((nextMembers) => {
        if (active) {
          setMembers(nextMembers);
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(getErrorMessage(error, 'load'));
        }
      })
      .finally(() => {
        if (active) {
          setLoadingMembers(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedPool]);

  const resetMessages = () => {
    setErrorMessage(null);
    setFeedbackMessage(null);
  };

  const handleCreatePool = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSubmitting(true);
    resetMessages();

    try {
      const poolId = await createPool(user, { name: poolName });
      setSelectedPoolId(poolId);
      setPoolName('');
      setFormMode(null);
      setFeedbackMessage('Bolão criado! Compartilhe o código com seus convidados.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'create'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinPool = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSubmitting(true);
    resetMessages();

    try {
      const result = await joinPoolByInviteCode(user, inviteCode);
      setSelectedPoolId(result.poolId);
      setInviteCode('');
      setFormMode(null);
      setFeedbackMessage(result.alreadyMember ? 'Você já participa desse bolão.' : 'Você entrou no bolão!');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'join'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pools-page" aria-labelledby="pools-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Fase 2</p>
          <h2 id="pools-title">Meus bolões</h2>
          <p>Crie um bolão ou entre com um código de convite de 6 caracteres.</p>
        </div>
      </div>

      <div className="action-grid" aria-label="Ações de bolão">
        <button type="button" onClick={() => setFormMode((mode) => (mode === 'create' ? null : 'create'))}>
          Criar bolão
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setFormMode((mode) => (mode === 'join' ? null : 'join'))}
        >
          Entrar por código
        </button>
      </div>

      {formMode === 'create' && (
        <form className="card stack-form" onSubmit={handleCreatePool}>
          <label>
            Nome do bolão
            <input
              value={poolName}
              onChange={(event) => setPoolName(event.target.value)}
              minLength={3}
              maxLength={80}
              placeholder="Ex.: Família rumo ao hexa"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar e gerar convite'}
          </button>
        </form>
      )}

      {formMode === 'join' && (
        <form className="card stack-form" onSubmit={handleJoinPool}>
          <label>
            Código de convite
            <input
              value={inviteCode}
              onChange={(event) => setInviteCode(normalizeInviteCode(event.target.value))}
              maxLength={6}
              placeholder="COPA26"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar no bolão'}
          </button>
        </form>
      )}

      {feedbackMessage && <p className="success-text">{feedbackMessage}</p>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {loadingPools ? (
        <div className="card loading-card" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          <p>Carregando seus bolões...</p>
        </div>
      ) : pools.length === 0 ? (
        <div className="empty-state card">
          <strong>Nenhum bolão ainda</strong>
          <p>Crie o primeiro bolão para virar dono ou peça um código para participar como membro.</p>
        </div>
      ) : (
        <>
          <div className="pool-list" aria-label="Lista de bolões">
            {pools.map((pool) => (
              <button
                type="button"
                key={pool.id}
                className={`pool-card ${selectedPool?.id === pool.id ? 'selected' : ''}`}
                onClick={() => setSelectedPoolId(pool.id)}
              >
                <span>{pool.name}</span>
                <small>{pool.championshipName}</small>
              </button>
            ))}
          </div>

          {selectedPool && (
            <article className="card pool-details" aria-labelledby="selected-pool-title">
              <div>
                <p className="eyebrow">Bolão selecionado</p>
                <h3 id="selected-pool-title">{selectedPool.name}</h3>
                <p>{selectedPool.championshipName}</p>
              </div>
              <div className="invite-code" aria-label="Código de convite">
                <span>Código</span>
                <strong>{selectedPool.inviteCode}</strong>
              </div>
              <div className="member-list">
                <div className="member-list-heading">
                  <strong>Participantes</strong>
                  <span>{loadingMembers ? 'Atualizando...' : `${members.length} membro(s)`}</span>
                </div>
                {members.map((member) => (
                  <div className="member-row" key={member.uid}>
                    <div>
                      <strong>{member.displayName}</strong>
                      {member.email && <small>{member.email}</small>}
                    </div>
                    <span>{roleLabels[member.role]}</span>
                  </div>
                ))}
              </div>
            </article>
          )}
        </>
      )}
    </section>
  );
}
