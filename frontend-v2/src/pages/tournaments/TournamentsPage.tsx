import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

interface Tournament {
  id: string;
  name: string;
  sport?: string;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'active' | 'finished';
  participants?: number;
}

const statusVariant: Record<string, 'green' | 'yellow' | 'gray'> = {
  upcoming: 'yellow',
  active: 'green',
  finished: 'gray',
};

const statusLabel: Record<string, string> = {
  upcoming: 'Proximo',
  active: 'En curso',
  finished: 'Finalizado',
};

export default function TournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: replace with real API call when tournaments endpoint is ready
    setTimeout(() => {
      setTournaments([]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-green-600 text-white p-6">
        <h1 className="text-2xl font-bold">Torneos</h1>
        <p className="text-green-100 text-sm mt-1">Competencias y eventos deportivos</p>
      </div>

      <div className="px-4 space-y-3">
        {tournaments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏆</p>
            <p className="text-lg font-medium text-gray-500">Sin torneos disponibles</p>
            <p className="text-sm mt-1">Proximamente encontraras torneos aqui</p>
          </div>
        ) : (
          tournaments.map(t => (
            <Card key={t.id} hover className="cursor-pointer" onClick={() => navigate('/tournaments/' + t.id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{t.name}</h3>
                  {t.sport && <p className="text-sm text-gray-500 mt-0.5">{t.sport}</p>}
                  {t.startDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Inicio: {new Date(t.startDate).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {t.status && (
                    <Badge variant={statusVariant[t.status] || 'gray'}>
                      {statusLabel[t.status] || t.status}
                    </Badge>
                  )}
                  {t.participants !== undefined && (
                    <span className="text-xs text-gray-400">{t.participants} participantes</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
