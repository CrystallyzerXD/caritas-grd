import { useEffect, useState } from 'react';
import { ShieldCheck, Plus, Pencil, Trash2, MapPin, Phone, Mail, Check, X } from 'lucide-react';
import { brigadistaService } from '../../services/brigadistaService';
import type { Brigadista, BrigadistaFormData, Parish } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { usePermissions } from '../../hooks/usePermissions';
import toast from 'react-hot-toast';
import api from '../../services/api';
import type { ApiResponse } from '../../types';

/* ── Form Modal ───────────────────────────────────────────────────────────── */

interface FormModalProps {
  brigadista?: Brigadista | null;
  parishes: Parish[];
  onSave: (data: BrigadistaFormData) => Promise<void>;
  onClose: () => void;
}

function FormModal({ brigadista, parishes, onSave, onClose }: FormModalProps) {
  const [form, setForm] = useState<BrigadistaFormData>({
    fullName: brigadista?.fullName ?? '',
    dni: brigadista?.dni ?? '',
    phone: brigadista?.phone ?? '',
    email: brigadista?.email ?? '',
    parishId: brigadista?.parishId,
    pastoralRole: brigadista?.pastoralRole ?? '',
    available: brigadista?.available ?? true,
    latitude: brigadista?.latitude,
    longitude: brigadista?.longitude,
    active: brigadista?.active ?? true,
    observations: brigadista?.observations ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof BrigadistaFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('El nombre es requerido'); return; }
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {brigadista ? 'Editar Brigadista' : 'Registrar Brigadista'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo *</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              required
            />
          </div>

          {/* DNI / Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">DNI</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.dni ?? ''}
                onChange={e => set('dni', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.phone ?? ''}
                onChange={e => set('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Correo electrónico</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
              value={form.email ?? ''}
              onChange={e => set('email', e.target.value)}
            />
          </div>

          {/* Parroquia / Rol pastoral */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parroquia</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.parishId ?? ''}
                onChange={e => set('parishId', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">— Sin parroquia —</option>
                {parishes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rol pastoral</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.pastoralRole ?? ''}
                onChange={e => set('pastoralRole', e.target.value)}
              />
            </div>
          </div>

          {/* Geolocalización */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Latitud</label>
              <input
                type="number"
                step="any"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.latitude ?? ''}
                onChange={e => set('latitude', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Longitud</label>
              <input
                type="number"
                step="any"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30"
                value={form.longitude ?? ''}
                onChange={e => set('longitude', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
            <textarea
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]/30 resize-none"
              value={form.observations ?? ''}
              onChange={e => set('observations', e.target.value)}
            />
          </div>

          {/* Switches */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.available ?? true}
                onChange={e => set('available', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Disponible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.active ?? true}
                onChange={e => set('active', e.target.checked)}
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={saving} className="flex-1">
              {brigadista ? 'Guardar cambios' : 'Registrar'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── BrigadistaList ────────────────────────────────────────────────────────── */

export function BrigadistaList() {
  const [brigadistas, setBrigadistas] = useState<Brigadista[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [modal, setModal] = useState<{ open: boolean; brigadista?: Brigadista | null }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { isAdmin, canManageBrigadistas } = usePermissions();

  const PAGE_SIZE = 20;

  const loadBrigadistas = async (p = page) => {
    setLoading(true);
    try {
      const data = await brigadistaService.getAll(p, PAGE_SIZE);
      setBrigadistas(data.content);
      setTotal(data.totalElements);
    } catch {
      toast.error('Error al cargar brigadistas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrigadistas();
    api.get<ApiResponse<Parish[]>>('/api/catalogs/parishes').then(r => {
      setParishes(r.data.data ?? []);
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSave = async (data: BrigadistaFormData) => {
    try {
      if (modal.brigadista) {
        await brigadistaService.update(modal.brigadista.id, data);
        toast.success('Brigadista actualizado');
      } else {
        await brigadistaService.create(data);
        toast.success('Brigadista registrado');
      }
      setModal({ open: false });
      loadBrigadistas();
    } catch {
      toast.error('Error al guardar brigadista');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await brigadistaService.delete(id);
      toast.success('Brigadista desactivado');
      setDeleteConfirm(null);
      loadBrigadistas();
    } catch {
      toast.error('Error al eliminar brigadista');
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#009850]" />
            Brigadistas Parroquiales
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Padrón de brigadistas voluntarios de la arquidiócesis · {total} registros
          </p>
        </div>
        {canManageBrigadistas && (
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModal({ open: true, brigadista: null })}>
            Nuevo Brigadista
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Cargando...</div>
        ) : brigadistas.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No hay brigadistas registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3 hidden md:table-cell">DNI</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Parroquia</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Rol pastoral</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Ubicación</th>
                  {canManageBrigadistas && <th className="px-4 py-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {brigadistas.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{b.fullName}</div>
                      <div className="flex gap-2 mt-0.5">
                        {b.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="h-3 w-3" />{b.phone}
                          </span>
                        )}
                        {b.email && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 hidden sm:flex">
                            <Mail className="h-3 w-3" />{b.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{b.dni ?? '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{b.parish ?? '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{b.pastoralRole ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={b.available ? 'success' : 'gray'}>
                          {b.available ? <><Check className="h-3 w-3 inline mr-0.5" />Disponible</> : 'No disponible'}
                        </Badge>
                        {!b.active && <Badge variant="danger">Inactivo</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-gray-500">
                      {b.latitude && b.longitude ? (
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3 text-[#009850]" />
                          {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                        </span>
                      ) : '—'}
                    </td>
                    {canManageBrigadistas && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setModal({ open: true, brigadista: b })}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            deleteConfirm === b.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(b.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium px-2"
                                >Confirmar</button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                                ><X className="h-3 w-3" /></button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(b.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                title="Desactivar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Página {page + 1} de {totalPages} · {total} registros
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Anterior</button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <FormModal
          brigadista={modal.brigadista}
          parishes={parishes}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
