/// <reference types="vite/client" />

// View Transitions API (not yet in all TS libs)
interface ViewTransition {
  ready:              Promise<void>;
  finished:           Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition():   void;
}

interface Document {
  startViewTransition?: (callback: () => void | Promise<void>) => ViewTransition;
}

// Allow importing image assets
declare module '*.png' { const src: string; export default src; }
declare module '*.jpg' { const src: string; export default src; }
declare module '*.svg' { const src: string; export default src; }

// Web Speech API (not in all TS lib versions)
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:     ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror:      ((this: SpeechRecognition, ev: Event) => void) | null;
  onend:        ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart:      ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: { new(): SpeechRecognition };

interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}
