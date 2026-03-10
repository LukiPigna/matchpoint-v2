import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = typeof data === 'string'
        ? data
        : Object.values(data ?? {}).flat().join(' ');
      setError(msg || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Crear cuenta</h2>
      <p className="text-sm text-gray-500 mb-6">Completa tus datos para registrarte</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            name="first_name"
            placeholder="Juan"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Apellido"
            name="last_name"
            placeholder="Perez"
            value={form.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        <Input
          label="Telefono"
          name="phone"
          type="tel"
          placeholder="+54 11 1234-5678"
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          label="Contrasena"
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          hint="Minimo 8 caracteres"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} fullWidth size="lg">
          Registrarme
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        Ya tenes cuenta?{' '}
        <Link to="/login" className="text-green-600 font-medium hover:underline">
          Ingresa
        </Link>
      </p>
    </div>
  );
}
