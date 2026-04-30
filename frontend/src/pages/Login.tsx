import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

interface FormData {
  email: string;
  password: string;
}

function CaritasCrossLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {/* Stylized Cáritas cross with leaf shapes */}
      <g transform="translate(50,50)">
        {/* Top arm */}
        <ellipse cx="0" cy="-28" rx="9" ry="18" transform="rotate(0)" />
        <ellipse cx="0" cy="-28" rx="9" ry="18" transform="rotate(45)" />
        {/* Right arm */}
        <ellipse cx="28" cy="0" rx="18" ry="9" transform="rotate(0)" />
        <ellipse cx="28" cy="0" rx="18" ry="9" transform="rotate(45)" />
        {/* Bottom arm */}
        <ellipse cx="0" cy="28" rx="9" ry="18" transform="rotate(0)" />
        <ellipse cx="0" cy="28" rx="9" ry="18" transform="rotate(-45)" />
        {/* Left arm */}
        <ellipse cx="-28" cy="0" rx="18" ry="9" transform="rotate(0)" />
        <ellipse cx="-28" cy="0" rx="18" ry="9" transform="rotate(-45)" />
        {/* Center */}
        <circle cx="0" cy="0" r="12" />
      </g>
    </svg>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const DEV_USERS = [
    { email: 'admin@caritas.pe',        password: 'Admin123!',  role: 'Admin',        color: 'bg-purple-100 text-purple-700' },
    { email: 'especialista@caritas.pe', password: 'Spec123!',   role: 'Especialista', color: 'bg-blue-100 text-blue-700' },
    { email: 'prueba@caritas.org.pe',   password: 'prueba123',  role: 'Especialista', color: 'bg-blue-100 text-blue-700' },
    { email: 'brigadista@caritas.pe',   password: 'Brig123!',   role: 'Brigadista',   color: 'bg-amber-100 text-amber-700' },
    { email: 'autorizado@caritas.pe',   password: 'Auth123!',   role: 'Autorizado',   color: 'bg-gray-100 text-gray-600' },
  ];

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Credenciales incorrectas. Intente nuevamente.';
      toast.error(msg);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #009850 0%, #0d5c0d 100%)' }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header verde */}
          <div className="px-8 pt-10 pb-8 text-center bg-white border-b border-gray-100">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <CaritasCrossLogo className="h-16 w-16 text-[#009850]" />
            </div>
            <h1 className="text-2xl font-bold text-[#009850] tracking-tight">Cáritas Lima</h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Sistema GRD y Medio Ambiente
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-base font-semibold text-gray-700 mb-6">Bienvenido, hora de trabajar</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="usuario@caritas.org.pe"
                    autoComplete="email"
                    {...register('email', {
                      required: 'El correo es obligatorio',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Ingrese un correo válido',
                      },
                    })}
                    className={[
                      'w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-[#009850] focus:border-transparent transition-colors',
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300',
                    ].join(' ')}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 4, message: 'Mínimo 4 caracteres' },
                    })}
                    className={[
                      'w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-[#009850] focus:border-transparent transition-colors',
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={[
                  'w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-colors mt-2',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009850]',
                  isSubmitting
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-[#009850] hover:bg-[#157a15] active:bg-[#0d5c0d]',
                ].join(' ')}
              >
                {isSubmitting ? 'Ingresando...' : 'Ingresar al sistema'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Cáritas Diocesana de Lima
            </p>
          </div>
        </div>

        {/* Dev credentials table */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
          <div className="px-4 py-2 border-b border-white/20">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              🔑 Cuentas de prueba — click para rellenar
            </p>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-1.5 text-left text-white/50 font-medium">Correo</th>
                <th className="px-3 py-1.5 text-left text-white/50 font-medium">Contraseña</th>
                <th className="px-3 py-1.5 text-left text-white/50 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody>
              {DEV_USERS.map((u) => (
                <tr
                  key={u.email}
                  onClick={() => fillCredentials(u.email, u.password)}
                  className="cursor-pointer hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  <td className="px-3 py-2 text-white/90 font-mono">{u.email}</td>
                  <td className="px-3 py-2 text-white/80 font-mono">{u.password}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${u.color}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
