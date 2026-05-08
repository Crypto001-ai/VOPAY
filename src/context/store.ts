import { create } from 'zustand';

interface UserState {
  isConnected: boolean;
  walletAddress: string | null;
  displayName: string | null;
  isVoiceEnabled: boolean;
  balance: number | null;
  isBalanceLoading: boolean;
  solanaNetwork: string | null;
  setConnection: (connected: boolean, address: string | null) => void;
  setDisplayName: (name: string | null) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setBalance: (balance: number | null) => void;
  setBalanceLoading: (loading: boolean) => void;
  setSolanaNetwork: (network: string | null) => void;
}

interface TransactionState {
  isAnalyzing: boolean;
  currentAnalysis: AnalysisResult | null;
  setAnalysis: (result: AnalysisResult | null) => void;
  setAnalyzing: (status: boolean) => void;
}

export interface AnalysisResult {
  id: string;
  riskScore: 'low' | 'medium' | 'high';
  summary: string;
  threats: string[];
  safePassage: string;
  recipient: {
    name: string;
    address: string;
    isSaved: boolean;
  };
  transaction: {
    amount: string;
    token: string;
    fee: string;
    speed: 'Instant' | 'Fast' | 'Normal';
  };
  alerts: {
    type: 'warning' | 'info' | 'error';
    message: string;
  }[];
}

interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isConnected: false,
  walletAddress: null,
  displayName: localStorage.getItem('vopay_display_name'),
  isVoiceEnabled: localStorage.getItem('vopay_voice_enabled') !== 'false',
  balance: null,
  isBalanceLoading: false,
  solanaNetwork: null,
  setConnection: (connected, address) => set({ isConnected: connected, walletAddress: address }),
  setDisplayName: (name) => {
    if (name) {
      localStorage.setItem('vopay_display_name', name);
    } else {
      localStorage.removeItem('vopay_display_name');
    }
    set({ displayName: name });
  },
  setVoiceEnabled: (enabled) => {
    localStorage.setItem('vopay_voice_enabled', String(enabled));
    set({ isVoiceEnabled: enabled });
  },
  setBalance: (balance) => set({ balance }),
  setBalanceLoading: (loading) => set({ isBalanceLoading: loading }),
  setSolanaNetwork: (network) => set({ solanaNetwork: network }),
}));

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

export const useTransactionStore = create<TransactionState>((set) => ({
  isAnalyzing: false,
  currentAnalysis: null,
  setAnalysis: (result) => set({ currentAnalysis: result }),
  setAnalyzing: (status) => set({ isAnalyzing: status }),
}));
