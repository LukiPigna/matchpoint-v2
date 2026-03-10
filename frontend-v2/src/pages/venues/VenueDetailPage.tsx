import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenueById } from '../../services/api/venues.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { Venue } from '../../types';

export default function VenueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getVenueById(id)
      .then(setVenue)
      .catch(() => setError('No se pudo cargar el complejo.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
    </div>
  );

  if (error || !venue) return (
    <div className="p-4 text-center">
      <p className="text-red-500 mb-4">{error || 'Complejo no encontrado.'}</p>
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
        <h1 className="text-2xl font-bold">{venue.name}</h1>
        <p className="text-green-100 text-sm mt-1">{venue.address}</p>
        {venue.city && <p className="text-green-200 text-xs mt-0.5">{venue.city}</p>}
      </div>

      <div className="px-4 space-y-4">
        {venue.sports && venue.sports.length > 0 && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-2">Deportes disponibles</h2>
            <div className="flex flex-wrap gap-2">
              {venue.sports.map((sport: string) => (
                <Badge key={sport} variant="green">{sport}</Badge>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Informacion</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {venue.phone && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Telefono:</span>
                <span className="text-green-600">{venue.phone}</span>
              </div>
            )}
            {venue.email && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Email:</span>
                <span className="text-green-600">{venue.email}</span>
              </div>
            )}
            {venue.openTime && venue.closeTime && (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Horario:</span>
                <span>{venue.openTime} - {venue.closeTime}</span>
              </div>
            )}
          </div>
        </Card>

        {venue.description && (
          <Card>
            <h2 className="font-semibold text-gray-800 mb-2">Descripcion</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
          </Card>
        )}

        <Button
          fullWidth
          size="lg"
          onClick={() => navigate('/bookings/new?venueId=' + venue.id)}
        >
          Reservar cancha
        </Button>
      </div>
    </div>
  );
}
