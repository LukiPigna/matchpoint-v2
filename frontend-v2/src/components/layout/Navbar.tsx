import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-2xl flex items-center justify-between h-14">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-bold text-green-600 tracking-tight"
        >
          MatchPoint
        </button>

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user.first_name}
            </span>
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm flex items-center justify-center"
            >
              {user.first_name?.[0]?.toUpperCase() ?? 'U'}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
