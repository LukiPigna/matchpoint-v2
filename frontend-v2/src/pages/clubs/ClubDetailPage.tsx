import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClubById } from '../../services/api/clubs.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { Club } from '../../types';

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getClubById(id)
      .then(setClub)
      .catch(() => setError('No se pudo cargar el club.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  );

  if (error || !club) return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-4">{error || 'Club no encontrado.'}</p>
      <Button variant="ghost" onClick={() => navigate(-1)}>Volver</Button>
    </div>
  );

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-green-600 text-white p-6 rounded-b-2xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-green-200 hover:text-white text-sm"
        >
          &larr; Volver
        </button>
        <h1 className="text-2xl font-bold">{club.name}</h1>
        {club.sport && (
          <span className="inline-block mt-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            {club.sport}
          </span>
        )}
      </div>

      <div className="px-4 space-y-4">
        {club.description && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-2">Descripcion</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{club.description}</p>
          </Card>
        )}

        {club.members !== undefined && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-3">Estadisticas</h2>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{club.members}</p>
                <p className="text-xs text-gray-500 mt-0.5">Miembros</p>
              </div>
              {club.matchesPlayed !== undefined && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{club.matchesPlayed}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Partidos jugados</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {club.tags && club.tags.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-2">Etiquetas</h2>
            <div className="flex flex-wrap gap-2">
              {club.tags.map((tag: string) => (
                <Badge key={tag} variant="gray">{tag}</Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
