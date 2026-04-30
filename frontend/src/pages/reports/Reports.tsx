import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Leaf,
  BarChart2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { reportService, downloadBlob } from '../../services/reportService';
import type { DashboardStats } from '../../types';
import { Button } from '../../components/common/Button';
import { PageSpinner } from '../../components/common/Spinner';

const PIE_COLORS = ['#009850', '#f59e0b', '#10b981', '#6b7280'];

export function Reports() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    reportService
      .getDashboard()
      .then(setStats)
      .catch(() => toast.error('Error al cargar los reportes'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (type: 'incidents' | 'affected' | 'environmental') => {
    setDownloading(type);
    const params: Record<string, string> = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    try {
      let blob: Blob;
      let filename: string;

      if (type === 'incidents') {
        blob = await reportService.downloadIncidentsExcel(params);
        filename = `incidencias_${Date.now()}.xlsx`;
      } else if (type === 'affected') {
        blob = await reportService.downloadAffectedPersonsExcel(params);
        filename = `personas_afectadas_${Date.now()}.xlsx`;
      } else {
        blob = await reportService.downloadEnvironmentalExcel(params);
        filename = `ambiental_${Date.now()}.xlsx`;
      }

      downloadBlob(blob, filename);
      toast.success('Archivo descargado correctamente');
    } catch {
      toast.error('Error al descargar el reporte');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) return <PageSpinner />;

  const byEventType = Object.entries(stats?.incidentsByEventType ?? {}).map(([name, value]) => ({ name, value }));
  const byStatus = [
    { name: 'Abierta',     value: stats?.openIncidents       ?? 0 },
    { name: 'En atención', value: stats?.inProgressIncidents ?? 0 },
    { name: 'Cerrada',     value: stats?.closedIncidents     ?? 0 },
    { name: 'Seguimiento', value: stats?.followUpIncidents   ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-gray-500">Estadísticas y exportación de datos</p>
      </div>

      {/* Export section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Download className="h-5 w-5 text-[#009850]" />
          <h2 className="font-semibold text-gray-800">Exportar Datos</h2>
        </div>

        {/* Date range */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Rango de fechas:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Desde:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Hasta:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#009850]"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-[#009850] hover:underline"
              >
                Limpiar fechas
              </button>
            )}
          </div>
        </div>

        {/* Download buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-[#009850]" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Incidencias</p>
                <p className="text-xs text-gray-500">Reporte completo de incidencias</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={<FileSpreadsheet className="h-4 w-4" />}
              loading={downloading === 'incidents'}
              onClick={() => handleDownload('incidents')}
            >
              Descargar Excel
            </Button>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Personas Afectadas</p>
                <p className="text-xs text-gray-500">Listado de afectados por incidencia</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={<FileSpreadsheet className="h-4 w-4" />}
              loading={downloading === 'affected'}
              onClick={() => handleDownload('affected')}
            >
              Descargar Excel
            </Button>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Ambiental</p>
                <p className="text-xs text-gray-500">Reporte de iniciativas ambientales</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              icon={<FileSpreadsheet className="h-4 w-4" />}
              loading={downloading === 'environmental'}
              onClick={() => handleDownload('environmental')}
            >
              Descargar Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Incidencias', value: stats.totalIncidents ?? 0, color: 'text-[#009850]', bg: 'bg-green-50' },
              { label: 'Incidencias Abiertas', value: stats.openIncidents ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Incidencias Cerradas', value: stats.closedIncidents ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Iniciativas Ambientales', value: stats.totalEnvironmentalInitiatives ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-800">Incidencias por Tipo de Evento</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byEventType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="value" fill="#009850" radius={[4, 4, 0, 0]} name="Incidencias" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-4">Distribución por Estado</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
