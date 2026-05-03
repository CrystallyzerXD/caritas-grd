import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users, Plus, ChevronDown, ChevronRight,
  Trash2, UserPlus, Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { incidentService } from '../../services/incidentService';
import type { AffectedFamily, AffectedPerson, AffectedPersonFormData, AffectedFamilyFormData } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Modal } from '../common/Modal';

// ── Shared person form ───────────────────────────────────────────────────────

function PersonForm({
  onSubmit,
  isSubmitting,
  onCancel,
  submitLabel = 'Registrar',
}: {
  onSubmit: (data: AffectedPersonFormData) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AffectedPersonFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nombre completo"
          required
          placeholder="Juan Pérez García"
          error={errors.fullName?.message}
          {...register('fullName', { required: 'El nombre es obligatorio' })}
        />
        <Input
          label="DNI"
          placeholder="12345678 (8 dígitos) o dejar vacío"
          maxLength={8}
          error={errors.dni?.message}
          {...register('dni', {
            validate: (v) => {
              const t = (v ?? '').trim();
              if (!t) return true;
              return /^\d{8}$/.test(t) || 'El DNI debe tener exactamente 8 dígitos';
            },
          })}
        />
        <Input
          label="Fecha de nacimiento"
          type="date"
          {...register('birthDate')}
        />
        <Select
          label="Sexo"
          options={[
            { value: 'M', label: 'Masculino' },
            { value: 'F', label: 'Femenino' },
            { value: 'OTRO', label: 'Otro' },
          ]}
          placeholder="Seleccionar"
          {...register('sex')}
        />
        <Input
          label="Teléfono"
          placeholder="987654321"
          {...register('phone')}
        />
        <Input
          label="Tipo de afectación"
          placeholder="Damnificado, Afectado..."
          {...register('damageType')}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={isSubmitting} fullWidth>{submitLabel}</Button>
        <Button type="button" variant="ghost" fullWidth onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}

// ── Family card ──────────────────────────────────────────────────────────────

function FamilyCard({
  family,
  incidentId,
  canEdit,
  onMemberAdded,
  onMemberRemoved,
  onFamilyDeleted,
}: {
  family: AffectedFamily;
  incidentId: number;
  canEdit: boolean;
  onMemberAdded: (familyId: number, person: AffectedPerson) => void;
  onMemberRemoved: (familyId: number, personId: number) => void;
  onFamilyDeleted: (familyId: number) => void;
}) {
  const [expanded, setExpanded]         = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const addMemberInFlight = useRef(false);

  const handleAddMember = async (data: AffectedPersonFormData) => {
    if (addMemberInFlight.current) return;
    addMemberInFlight.current = true;
    setSubmitting(true);
    try {
      const person = await incidentService.addFamilyMember(incidentId, family.id, data);
      onMemberAdded(family.id, person);
      setShowAddMember(false);
      toast.success('Miembro registrado');
    } catch {
      toast.error('Error al registrar miembro');
    } finally {
      addMemberInFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (personId: number) => {
    if (!confirm('¿Eliminar este miembro de la familia?')) return;
    try {
      await incidentService.removeFamilyMember(incidentId, family.id, personId);
      onMemberRemoved(family.id, personId);
      toast.success('Miembro eliminado');
    } catch {
      toast.error('Error al eliminar miembro');
    }
  };

  const handleDeleteFamily = async () => {
    if (!confirm(`¿Eliminar ${family.name ? `"${family.name}"` : 'esta familia'} y todos sus miembros?`)) return;
    try {
      await incidentService.deleteFamily(incidentId, family.id);
      onFamilyDeleted(family.id);
      toast.success('Familia eliminada');
    } catch {
      toast.error('Error al eliminar familia');
    }
  };

  const sexLabel = (s?: string) => s === 'M' ? 'Masc.' : s === 'F' ? 'Fem.' : s ?? '—';

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Family header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <Home className="h-4 w-4 text-[#009850] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-gray-800">
            {family.name || 'Familia sin nombre'}
          </span>
          {family.address && (
            <span className="ml-2 text-xs text-gray-500">{family.address}</span>
          )}
        </div>
        <span className="text-xs bg-[#009850]/10 text-[#009850] font-medium px-2 py-0.5 rounded-full">
          {family.members.length} {family.members.length === 1 ? 'miembro' : 'miembros'}
        </span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowAddMember(true)}
              title="Agregar miembro"
              className="p-1.5 rounded-lg text-[#009850] hover:bg-[#009850]/10 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleDeleteFamily}
              title="Eliminar familia"
              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Members list */}
      {expanded && (
        <>
          {family.members.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 italic text-center">
              Sin miembros aún — agrega el primero
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {family.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800">{m.fullName}</span>
                    <span className="ml-3 text-xs text-gray-500">
                      {[m.dni && `DNI: ${m.dni}`, sexLabel(m.sex), m.phone, m.damageType]
                        .filter(Boolean).join(' · ')}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="p-1 rounded text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add member modal */}
      <Modal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        title={`Agregar miembro — ${family.name || 'Familia'}`}
        size="lg"
      >
        <PersonForm
          onSubmit={handleAddMember}
          isSubmitting={submitting}
          onCancel={() => setShowAddMember(false)}
          submitLabel="Agregar miembro"
        />
      </Modal>
    </div>
  );
}

// ── Main section component ───────────────────────────────────────────────────

interface Props {
  incidentId: number;
  initialPersons: AffectedPerson[];
  initialFamilies: AffectedFamily[];
  canEdit: boolean;
}

export function AffectedSection({ incidentId, initialPersons, initialFamilies, canEdit }: Props) {
  const [persons,  setPersons]  = useState<AffectedPerson[]>(initialPersons);
  const [families, setFamilies] = useState<AffectedFamily[]>(initialFamilies);

  // Dropdown menu state
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [submitting,      setSubmitting]      = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting: famSubmitting } } =
    useForm<AffectedFamilyFormData>();

  // ── Person handlers ────────────────────────────────────────────────────────

  const handleAddPerson = async (data: AffectedPersonFormData) => {
    setSubmitting(true);
    try {
      const p = await incidentService.addAffectedPerson(incidentId, data);
      setPersons((prev) => [...prev, p]);
      setShowPersonModal(false);
      toast.success('Persona registrada');
    } catch {
      toast.error('Error al registrar persona');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePerson = async (personId: number) => {
    if (!confirm('¿Eliminar esta persona?')) return;
    try {
      await incidentService.deleteAffectedPerson(incidentId, personId);
      setPersons((prev) => prev.filter((p) => p.id !== personId));
      toast.success('Persona eliminada');
    } catch {
      toast.error('Error al eliminar persona');
    }
  };

  // ── Family handlers ────────────────────────────────────────────────────────

  const handleCreateFamily = async (data: AffectedFamilyFormData) => {
    try {
      const f = await incidentService.createFamily(incidentId, data);
      setFamilies((prev) => [...prev, f]);
      setShowFamilyModal(false);
      reset();
      toast.success('Familia creada');
    } catch {
      toast.error('Error al crear familia');
    }
  };

  const handleMemberAdded = (familyId: number, person: AffectedPerson) => {
    setFamilies((prev) =>
      prev.map((f) => f.id === familyId ? { ...f, members: [...f.members, person] } : f)
    );
  };

  const handleMemberRemoved = (familyId: number, personId: number) => {
    setFamilies((prev) =>
      prev.map((f) =>
        f.id === familyId ? { ...f, members: f.members.filter((m) => m.id !== personId) } : f
      )
    );
  };

  const handleFamilyDeleted = (familyId: number) => {
    setFamilies((prev) => prev.filter((f) => f.id !== familyId));
  };

  // ── Counts ─────────────────────────────────────────────────────────────────
  const totalMembers = families.reduce((acc, f) => acc + f.members.length, 0);
  const total = persons.length + totalMembers + families.length;

  const sexLabel = (s?: string) => s === 'M' ? 'Masc.' : s === 'F' ? 'Fem.' : s ?? '—';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">
            Personas y Familias Afectadas
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({families.length} {families.length === 1 ? 'familia' : 'familias'},{' '}
               {persons.length} {persons.length === 1 ? 'persona' : 'personas'})
            </span>
          </h2>
        </div>

        {canEdit && (
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setMenuOpen((p) => !p)}
            >
              Agregar
            </Button>
            {menuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-52 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setShowPersonModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 text-[#009850]" />
                    <div className="text-left">
                      <div className="font-medium">Una persona</div>
                      <div className="text-xs text-gray-400">Sin familia registrada</div>
                    </div>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); setShowFamilyModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Home className="h-4 w-4 text-[#009850]" />
                    <div className="text-left">
                      <div className="font-medium">Una familia</div>
                      <div className="text-xs text-gray-400">Registra miembros del grupo</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {total === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-400">
          No hay personas ni familias afectadas registradas
        </div>
      ) : (
        <div className="p-5 space-y-4">

          {/* Families */}
          {families.map((f) => (
            <FamilyCard
              key={f.id}
              family={f}
              incidentId={incidentId}
              canEdit={canEdit}
              onMemberAdded={handleMemberAdded}
              onMemberRemoved={handleMemberRemoved}
              onFamilyDeleted={handleFamilyDeleted}
            />
          ))}

          {/* Standalone persons */}
          {persons.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Personas sin familia registrada
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {persons.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">{p.fullName}</span>
                      <span className="ml-3 text-xs text-gray-500">
                        {[p.dni && `DNI: ${p.dni}`, sexLabel(p.sex), p.phone, p.damageType]
                          .filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleDeletePerson(p.id)}
                        className="p-1 rounded text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add standalone person modal */}
      <Modal
        isOpen={showPersonModal}
        onClose={() => setShowPersonModal(false)}
        title="Registrar Persona Afectada"
        size="lg"
      >
        <PersonForm
          onSubmit={handleAddPerson}
          isSubmitting={submitting}
          onCancel={() => setShowPersonModal(false)}
        />
      </Modal>

      {/* Create family modal */}
      <Modal
        isOpen={showFamilyModal}
        onClose={() => { setShowFamilyModal(false); reset(); }}
        title="Registrar Familia Afectada"
        size="md"
      >
        <form onSubmit={handleSubmit(handleCreateFamily)} className="space-y-4">
          <p className="text-sm text-gray-500">
            Crea la familia primero. Luego podrás agregar a cada miembro con sus datos personales.
          </p>
          <Input
            label="Nombre de la familia"
            placeholder="Ej: Familia Pérez Rojas (opcional)"
            {...register('name')}
          />
          <Input
            label="Dirección"
            placeholder="Ej: Jr. Las Flores 456, San Juan de Lurigancho"
            {...register('address')}
          />
          <Input
            label="Observaciones"
            placeholder="Notas adicionales sobre la situación de la familia..."
            {...register('observations')}
          />
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={famSubmitting} fullWidth>Crear familia</Button>
            <Button type="button" variant="ghost" fullWidth onClick={() => { setShowFamilyModal(false); reset(); }}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
