import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../../services/api/bookings.api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import type { Booking } from '../../types';

const statusLabel: Record<string, string> = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
  completed: 'Completada',
};

const statusVariant: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  confirmed: 'green',
  pending: 'yellow',
  cancelled: 'red',
  completed: 'gray',
};

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    getMyBookings()
      .then(data => setBookings(data.results ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(id: number) {
    if (!confirm('Cancelar esta reserva?')) return;
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch {
      alert('No se pudo cancelar la reserva');
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Mis reservas</h1>
        <Button size="sm" onClick={() => navigate('/bookings/new')}>+ Nueva</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 mb-3">No tenes reservas todavia</p>
          <Button onClick={() => navigate('/bookings/new')}>Reservar cancha</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <Card key={booking.id} padding="md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {booking.venue_name ?? 'Cancha'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(booking.start_time).toLocaleDateString('es-AR', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.start_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(booking.end_time).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {booking.total_price && (
                    <p className="text-sm font-semibold text-green-700 mt-1">${booking.total_price}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusVariant[booking.status] ?? 'gray'}>
                    {statusLabel[booking.status] ?? booking.status}
                  </Badge>
                  {(booking.status === 'confirmed' || booking.status === 'pending') && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={cancelling === booking.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      {cancelling === booking.id ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
