import { useEffect, useState } from 'react';
import { Plus, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import { catalogService } from '../../services/catalogService';
import type { User, UserFormData, Parish } from '../../types';
import { RoleBadge, Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { PageSpinner } from '../../components/common/Spinner';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'GRD_SPECIALIST', label: 'Especialista GRD' },
  { value: 'BRIGADISTA', label: 'Brigadista' },
  { value: 'AUTHORIZED_USER', label: 'Usuario Autorizado' },
];

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({ defaultValues: { active: true } });

  const load = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        userService.getAll(),
        catalogService.getParishes().catch(() => []),
      ]);
      setUsers(u);
      setParishes(p);
    } catch {
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditUser(null);
    reset({ active: true });
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    reset({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      active: user.active ?? true,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editUser) {
        const updated = await userService.update(editUser.id, data);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        toast.success('Usuario actualizado');
      } else {
        const created = await userService.create(data);
        setUsers((prev) => [...prev, created]);
        toast.success('Usuario creado correctamente');
      }
      setModalOpen(false);
    } catch {
      toast.error(editUser ? 'Error al actualizar el usuario' : 'Error al crear el usuario');
    }
  };

  const toggleActive = async (user: User) => {
    try {
      const updated = await userService.toggleActive(user.id, !user.active);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(updated.active ? 'Usuario activado' : 'Usuario desactivado');
    } catch {
      toast.error('Error al cambiar el estado del usuario');
    }
  };

  const parishOptions = parishes.map((p) => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500">Administre los usuarios del sistema</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <PageSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Nombre', 'Correo electrónico', 'Rol', 'Teléfono', 'Parroquia', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#009850]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#009850]">
                              {user.fullName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.parish ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? 'success' : 'gray'}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(user)}
                            className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(user)}
                            className={[
                              'p-1.5 rounded-lg transition-colors',
                              user.active
                                ? 'hover:bg-gray-100 text-gray-500'
                                : 'hover:bg-green-50 text-green-600',
                            ].join(' ')}
                            title={user.active ? 'Desactivar' : 'Activar'}
                          >
                            {user.active ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Nombre completo"
                required
                placeholder="Juan García Pérez"
                error={errors.fullName?.message}
                {...register('fullName', { required: 'El nombre es obligatorio' })}
              />
            </div>
            <Input
              label="Correo electrónico"
              type="email"
              required
              placeholder="usuario@caritas.org.pe"
              error={errors.email?.message}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
              })}
            />
            {!editUser && (
              <Input
                label="Contraseña"
                type="password"
                required={!editUser}
                placeholder="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password', {
                  required: editUser ? false : 'La contraseña es obligatoria',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                })}
              />
            )}
            <Select
              label="Rol"
              required
              options={ROLE_OPTIONS}
              placeholder="Seleccionar rol..."
              error={errors.role?.message}
              {...register('role', { required: 'Seleccione el rol' })}
            />
            <Input
              label="Teléfono"
              placeholder="987654321"
              {...register('phone')}
            />
            {parishOptions.length > 0 && (
              <Select
                label="Parroquia"
                options={parishOptions}
                placeholder="Seleccionar parroquia..."
                {...register('parishId')}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              className="h-4 w-4 rounded border-gray-300 text-[#009850] focus:ring-[#009850]"
              {...register('active')}
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Usuario activo
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting} fullWidth>
              {editUser ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
