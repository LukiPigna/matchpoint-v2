import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyBookings } from '../../services/api/bookings.api';
import { getVenues } from '../../services/api/venues.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import type { Booking, Venue } from '../../types';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyBookings(), getVenues()])
      .then(([b, v]) => {
        setBookings(b.results?.slice(0, 3) ?? b.slice(0, 3));
        setVenues(v.results?.slice(0, 4) ?? v.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hola, {user?.first_name}!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Que jugamos hoy?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/bookings/new')}
        >
          + Reservar cancha
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => navigate('/tournaments')}
        >
          Ver torneos
        </Button>
      </div>

      {/* Upcoming bookings */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Proximas reservas</h2>
          <button
            onClick={() => navigate('/bookings')}
            className="text-sm text-green-600 hover:underline"
          >
            Ver todas
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-400 text-sm">No tenes reservas proximas</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-green-600"
              onClick={() => navigate('/bookings/new')}
            >
              Hacer una reserva
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map(booking => (
              <Card key={booking.id} hover onClick={() => navigate(`/bookings/${booking.id}`)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {booking.venue_name ?? 'Cancha'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(booking.start_time).toLocaleDateString('es-AR', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}{' '}
                      {new Date(booking.start_time).toLocaleTimeString('es-AR', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <Badge variant={booking.status === 'confirmed' ? 'green' : 'yellow'}>
                    {booking.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Nearby venues */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Canchas destacadas</h2>
          <button
            onClick={() => navigate('/venues')}
            className="text-sm text-green-600 hover:underline"
          >
            Ver todas
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {venues.map(venue => (
              <Card
                key={venue.id}
                padding="sm"
                hover
                onClick={() => navigate(`/venues/${venue.id}`)}
              >
                <div className="aspect-video bg-green-50 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-2xl">🎾</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{venue.name}</p>
                <p className="text-xs text-gray-500 truncate">{venue.address}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
