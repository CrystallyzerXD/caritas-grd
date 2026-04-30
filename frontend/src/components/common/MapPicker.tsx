import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, X, Check, Loader2 } from 'lucide-react';

// ── Fix Leaflet icon paths for Vite ──────────────────────────────────────────
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PickedLocation {
  lat: number;
  lng: number;
  address?: string;
  /** Raw district/suburb name returned by Nominatim — used to auto-fill the district select */
  districtName?: string;
}

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (loc: PickedLocation) => void;
  onClose: () => void;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface NominatimReverseResult {
  display_name: string;
  address: {
    city_district?: string;
    suburb?:        string;
    town?:          string;
    village?:       string;
    county?:        string;
    state_district?: string;
  };
}

// ── Sub-components (must live inside MapContainer) ────────────────────────────

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 1 });
  }, [map, target]);
  return null;
}

// ── Main component ────────────────────────────────────────────────────────────

const LIMA: [number, number] = [-12.0464, -77.0428];

export function MapPicker({ initialLat, initialLng, onConfirm, onClose }: MapPickerProps) {
  const hasInitial = initialLat !== undefined && initialLng !== undefined;

  const [position, setPosition] = useState<[number, number] | null>(
    hasInitial ? [initialLat!, initialLng!] : null,
  );
  const [address,      setAddress]      = useState('');
  const [districtName, setDistrictName] = useState('');
  const [query,        setQuery]        = useState('');
  const [results,      setResults]      = useState<NominatimResult[]>([]);
  const [searching,    setSearching]    = useState(false);
  const [flyTarget,    setFlyTarget]    = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  // Reverse-geocode a clicked point — also extracts the district name
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } },
      );
      const d: NominatimReverseResult = await r.json();
      setAddress(d.display_name ?? '');
      // Nominatim returns Lima districts in city_district, suburb, or town
      const district =
        d.address?.city_district ??
        d.address?.suburb ??
        d.address?.town ??
        d.address?.village ??
        d.address?.county ??
        '';
      setDistrictName(district);
    } catch {
      setAddress('');
      setDistrictName('');
    }
  }, []);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
    setResults([]);
  }, [reverseGeocode]);

  // Debounced forward-geocode search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pe`,
          { headers: { 'Accept-Language': 'es' } },
        );
        setResults(await r.json());
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 500);
  }, [query]);

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setPosition([lat, lng]);
    setAddress(r.display_name);
    setQuery(r.display_name);
    setResults([]);
    setFlyTarget([lat, lng]);
    // Reverse geocode the selected point to get the district
    reverseGeocode(lat, lng);
  };

  const center: [number, number] = position ?? (hasInitial ? [initialLat!, initialLng!] : LIMA);

  // ── Render via portal so it's outside the <form> DOM ──────────────────────
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ height: 'min(600px, 90vh)' }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#009850]" />
            <span className="font-semibold text-gray-800">Seleccionar ubicación</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar dirección en Perú…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009850] focus:border-transparent"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {results.length > 0 && (
            <ul className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => selectResult(r)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-start gap-2"
                  >
                    <MapPin className="h-4 w-4 text-[#009850] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 line-clamp-2">{r.display_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map — explicit pixel height so Leaflet always has a defined container */}
        <div className="relative flex-1" style={{ minHeight: 0 }}>
          <MapContainer
            center={center}
            zoom={hasInitial ? 15 : 13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <ClickHandler onPick={handleMapClick} />
            <FlyTo target={flyTarget} />
            {position && <Marker position={position} />}
          </MapContainer>

          {!position && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow text-xs text-gray-600 pointer-events-none whitespace-nowrap">
              Haz clic en el mapa para colocar el pin 📍
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
          {position ? (
            <p className="flex-1 text-xs text-gray-500 truncate">
              <span className="font-mono font-medium text-gray-700">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </span>
              {address && <> · <span className="truncate">{address}</span></>}
            </p>
          ) : (
            <p className="flex-1 text-xs text-gray-400">Ningún punto seleccionado</p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!position}
            onClick={() => position && onConfirm({ lat: position[0], lng: position[1], address, districtName })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#009850] rounded-lg hover:bg-[#007a40] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check className="h-4 w-4" />
            Confirmar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
