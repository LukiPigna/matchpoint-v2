import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getVenues } from '../../services/api/venues.api';
import { createBooking } from '../../services/api/bookings.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import type { Venue } from '../../types';

export default function NewBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    venue: searchParams.get('venue') ?? '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  useEffect(() => {
    getVenues()
      .then(data => setVenues(data.results ?? data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.venue) { setError('Selecciona una cancha'); return; }
    setSubmitting(true);
    try {
      const start_time = `${form.date}T${form.start_time}:00`;
      const end_time = `${form.date}T${form.end_time}:00`;
      await createBooking({ venue: Number(form.venue), start_time, end_time, notes: form.notes });
      navigate('/bookings');
    } catch (err: any) {
      const data = err?.response?.data;
      setError(typeof data === 'string' ? data : Object.values(data ?? {}).flat().join(' ') || 'Error al reservar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Nueva reserva</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Venue selector */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Cancha</label>
            <select
              name="venue"
              value={form.venue}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Seleccionar cancha...</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} — {v.address}</option>
              ))}
            </select>
          </div>

          <Input
            label="Fecha"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Hora inicio"
              name="start_time"
              type="time"
              value={form.start_time}
              onChange={handleChange}
              required
            />
            <Input
              label="Hora fin"
              name="end_time"
              type="time"
              value={form.end_time}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={submitting} fullWidth size="lg">
            Confirmar reserva
          </Button>
        </form>
      </Card>
    </div>
  );
}
