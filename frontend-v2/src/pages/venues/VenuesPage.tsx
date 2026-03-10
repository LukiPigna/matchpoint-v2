import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVenues } from '../../services/api/venues.api';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import type { Venue } from '../../types';

export default function VenuesPage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filtered, setFiltered] = useState<Venue[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then(data => {
        const list = data.results ?? data;
        setVenues(list);
        setFiltered(list);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(venues.filter(v =>
      v.name.toLowerCase().includes(q) || v.address?.toLowerCase().includes(q)
    ));
  }, [search, venues]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Canchas</h1>

      <Input
        placeholder="Buscar por nombre o direccion..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No se encontraron canchas</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(venue => (
            <Card key={venue.id} hover onClick={() => navigate(`/venues/${venue.id}`)}>
              <div className="flex gap-3 items-start">
                <div className="w-14 h-14 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-2xl">
                  🎾
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{venue.name}</p>
                  <p className="text-sm text-gray-500 truncate">{venue.address}</p>
                  {venue.hourly_rate && (
                    <p className="text-sm text-green-700 font-medium mt-1">${venue.hourly_rate}/h</p>
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
