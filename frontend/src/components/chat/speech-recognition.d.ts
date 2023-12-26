declare global {
    interface Window {
      SpeechRecognition: SpeechRecognitionStatic;
      webkitSpeechRecognition: SpeechRecognitionStatic;
    }
  
    interface SpeechRecognitionStatic {
      new (): SpeechRecognition;
    }
  
    interface SpeechRecognition extends EventTarget {
      lang: string;
      interimResults: boolean;
      maxAlternatives: number;
      onresult: (event: SpeechRecognitionEvent) => void;
      onerror: (event: SpeechRecognitionErrorEvent) => void;
      start: () => void;
      stop: () => void;
      // Add other properties and methods you need
    }
  
    interface SpeechRecognitionEvent extends Event {
      results: SpeechRecognitionResultList;
      resultIndex: number;
      // Add other properties you need
    }
  
    interface SpeechRecognitionResultList {
      length: number;
      item: (index: number) => SpeechRecognitionResult;
    }
  
    interface SpeechRecognitionResult {
      isFinal: boolean;
      item: (index: number) => SpeechRecognitionAlternative;
    }
  
    interface SpeechRecognitionAlternative {
      transcript: string;
      confidence: number;
    }
  }
  
  export {};
  