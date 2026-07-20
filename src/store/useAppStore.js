import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // API Keys
  apiKeys: {
    gemini: localStorage.getItem('gemini_api_key') || '',
    openai: localStorage.getItem('openai_api_key') || '',
    elevenlabs: localStorage.getItem('elevenlabs_api_key') || '',
    whisper: localStorage.getItem('whisper_api_key') || '',
  },
  setApiKey: (provider, key) => {
    localStorage.setItem(`${provider}_api_key`, key);
    set((state) => ({
      apiKeys: { ...state.apiKeys, [provider]: key }
    }));
  },

  // Current Project
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),

  // Video State
  videoFile: null,
  videoUrl: null,
  videoMeta: { duration: 0, width: 0, height: 0 },
  setVideo: (file, url, meta) => set({ videoFile: file, videoUrl: url, videoMeta: meta }),
  clearVideo: () => set({ videoFile: null, videoUrl: null, videoMeta: { duration: 0, width: 0, height: 0 } }),

  // Playback State
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  playbackSpeed: 1,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (vol) => set({ volume: vol }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // Timeline State
  subtitles: [],
  voiceover: null,
  script: '',
  setSubtitles: (subs) => set({ subtitles: subs }),
  setVoiceover: (vo) => set({ voiceover: vo }),
  setScript: (script) => set({ script: script }),

  // Processing State
  processingStatus: 'idle', // idle, analyzing, generating, rendering
  processingProgress: 0,
  processingStage: '',
  setProcessingStatus: (status) => set({ processingStatus: status }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setProcessingStage: (stage) => set({ processingStage: stage }),

  // Export Settings
  exportSettings: {
    resolution: '1080p',
    quality: 'high',
    format: 'mp4',
    includeSubtitles: true,
    includeVoiceover: true,
  },
  setExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings }
  })),

  // Toast Notifications
  toasts: [],
  addToast: (toast) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { ...toast, id }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 5000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),

  // Active Panel
  activePanel: 'upload', // upload, editor, settings
  setActivePanel: (panel) => set({ activePanel: panel }),
}));

export default useAppStore;
