import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, MobileBottomNav, Sidebar } from './components/Navigation';
import Footer from './components/Footer';
import { WalletContextProvider } from './context/WalletContextProvider';
import { WalletSync } from './context/WalletSync';
import { BalanceSynchronizer } from './context/BalanceSynchronizer';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import TransactionAssistantPage from './pages/TransactionAssistantPage';
import ConnectWalletPage from './pages/ConnectWalletPage';
import AnalysisPage from './pages/AnalysisPage';
import ConfirmationGatePage from './pages/ConfirmationGatePage';
import SuccessPage from './pages/SuccessPage';
import SettingsPage from './pages/SettingsPage';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeStore } from './context/store';
import { useEffect } from 'react';

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  return (
    <WalletContextProvider>
      <WalletSync />
      <BalanceSynchronizer />
      <Router>
        <div className="min-h-screen bg-background text-foreground transition-colors relative flex overflow-x-hidden selection:bg-solana-purple/30">
          <Sidebar />
          
          <div className="flex-1 flex flex-col md:pl-64 min-h-screen relative overflow-x-hidden">
            <Header />
            
            <main className="flex-1 relative z-10 pb-32 md:pb-0 scroll-smooth">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/assistant" element={<TransactionAssistantPage />} />
                <Route path="/connect" element={<ConnectWalletPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/confirm" element={<ConfirmationGatePage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>

            <Footer />
          </div>

          <MobileBottomNav />

          {/* Global background effects */}
          <div className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] bg-solana-purple/10 blur-[130px] rounded-full pointer-events-none opacity-50 dark:opacity-100" />
          <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-solana-green/10 blur-[120px] rounded-full pointer-events-none opacity-50 dark:opacity-100" />
        </div>
      </Router>
    </WalletContextProvider>
  );
}
