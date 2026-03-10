import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClubs } from '../../services/api/clubs.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import type { Club } from '../../types';

export default function ClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getClubs()
      .then(setClubs)
      .catch(() => setError('No se pudieron cargar los clubes.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-green-600 text-white p-6">
        <h1 className="text-2xl font-bold">Clubes</h1>
        <p className="text-green-100 text-sm mt-1">Explora los clubes disponibles</p>
      </div>

      <div className="px-4 space-y-3">
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {clubs.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">Sin clubes disponibles</p>
            <p className="text-sm mt-1">Vuelve a intentarlo mas tarde</p>
          </div>
        )}

        {clubs.map(club => (
          <Card
            key={club.id}
            hover
            className="cursor-pointer"
            onClick={() => navigate('/clubs/' + club.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{club.name}</h3>
                {club.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{club.description}</p>
                )}
                {club.sport && (
                  <div className="mt-2">
                    <Badge variant="blue">{club.sport}</Badge>
                  </div>
                )}
              </div>
              <span className="text-gray-300 text-lg flex-shrink-0">&rsaquo;</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
