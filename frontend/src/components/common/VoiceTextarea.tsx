import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { Mic, Square } from 'lucide-react';

interface VoiceTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  rows?: number;
  error?: boolean;
  disabled?: boolean;
}

export const VoiceTextarea = forwardRef<HTMLTextAreaElement, VoiceTextareaProps>(
  function VoiceTextarea(
    {
      value = '',
      onChange,
      onBlur,
      name,
      placeholder,
      rows = 3,
      error = false,
      disabled = false,
    },
    ref,
  ) {
    const [isRecording, setIsRecording] = useState(false);
    const [supported, setSupported] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Text committed before the current recording session
    const committedRef    = useRef('');
    const sessionFinalRef = useRef('');

    useEffect(() => {
      setSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
    }, []);

    const start = useCallback(() => {
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!SR) return;

      committedRef.current    = value;
      sessionFinalRef.current = '';

      const rec = new SR();
      rec.lang            = 'es-PE';
      rec.continuous      = true;
      rec.interimResults  = true;
      recognitionRef.current = rec;

      rec.onresult = (e: SpeechRecognitionEvent) => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            sessionFinalRef.current += t + ' ';
          } else {
            interim = t;
          }
        }
        const base     = committedRef.current;
        const combined = (base ? base + ' ' : '') + sessionFinalRef.current + (interim || '');
        onChange?.(combined.trim());
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend   = () => setIsRecording(false);

      rec.start();
      setIsRecording(true);
    }, [value, onChange]);

    const stop = useCallback(() => {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }, []);

    return (
      <div className="relative">
        <textarea
          ref={ref}
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none',
            supported ? 'pr-10' : 'pr-3',
            isRecording
              ? 'border-[#009850] ring-2 ring-[#009850]/25 focus:ring-[#009850]'
              : error
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-gray-300 focus:ring-[#009850]',
          ].join(' ')}
        />

        {supported && (
          <>
            <button
              type="button"
              onClick={() => (isRecording ? stop() : start())}
              disabled={disabled}
              title={isRecording ? 'Detener dictado' : 'Dictar por voz'}
              className={[
                'absolute bottom-2 right-2 p-1.5 rounded-lg transition-all focus:outline-none',
                isRecording
                  ? 'bg-red-100 text-red-500 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-[#009850]/10 hover:text-[#009850]',
              ].join(' ')}
            >
              {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {isRecording && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
            )}
          </>
        )}
      </div>
    );
  },
);
