import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface ComboboxOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Buscar o seleccionar...',
  error,
  hint,
  required,
  disabled,
}) => {
  const selected = options.find((o) => o.value === value);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const filtered = query.trim()
    ? options.filter((o) => normalize(o.label).includes(normalize(query)))
    : options;

  const handleSelect = useCallback(
    (opt: ComboboxOption) => {
      onChange(opt.value);
      setOpen(false);
      setQuery('');
    },
    [onChange]
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!open) setOpen(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Enter' && filtered.length === 1) {
      e.preventDefault();
      handleSelect(filtered[0]);
    }
  };

  // While dropdown open: show typed query; otherwise show selected label
  const displayValue = open ? query : (selected?.label ?? '');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Wrapper — relative so dropdown anchors here */}
      <div className="relative" ref={containerRef}>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 pr-14',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[#009850] focus:border-transparent bg-white',
            error  ? 'border-red-400 bg-red-50'         : 'border-gray-300 hover:border-gray-400',
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : '',
          ].join(' ')}
        />

        {/* Icon buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center gap-0.5 pr-2">
          {selected && !disabled && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label="Limpiar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if (!disabled) { setOpen((p) => !p); inputRef.current?.focus(); } }}
            className="p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400 italic">Sin resultados</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                  className={[
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    opt.value === value
                      ? 'bg-[#009850]/10 text-[#009850] font-medium'
                      : 'text-gray-800 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error  && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
};
