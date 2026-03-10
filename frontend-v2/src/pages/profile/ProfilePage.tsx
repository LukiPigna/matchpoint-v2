import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-green-600 text-white p-6">
        <h1 className="text-2xl font-bold">Mi perfil</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* User info */}
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-lg truncate">
                {user?.name || 'Usuario'}
              </h2>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Account section */}
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/bookings')}
            >
              <span>Mis reservas</span>
              <span className="text-gray-300">&rsaquo;</span>
            </button>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => navigate('/clubs')}
            >
              <span>Mis clubes</span>
              <span className="text-gray-300">&rsaquo;</span>
            </button>
          </div>
        </Card>

        {/* App section */}
        <Card padding="none">
          <div className="divide-y divide-gray-100">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {}}
            >
              <span>Notificaciones</span>
              <span className="text-gray-300">&rsaquo;</span>
            </button>
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => {}}
            >
              <span>Ayuda y soporte</span>
              <span className="text-gray-300">&rsaquo;</span>
            </button>
          </div>
        </Card>

        <Button
          variant="danger"
          fullWidth
          loading={loggingOut}
          onClick={handleLogout}
        >
          Cerrar sesion
        </Button>

        <p className="text-center text-xs text-gray-400">MatchPoint v2.0</p>
      </div>
    </div>
  );
}
