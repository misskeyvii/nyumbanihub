import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useState, useEffect, createContext, useContext } from "react";

export const DarkModeContext = createContext({ dark: false, toggle: () => {} });
export const useDarkMode = () => useContext(DarkModeContext);

function BackButtonHandler() {
  const location = useLocation();
  const [backPressCount, setBackPressCount] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      
      if (location.pathname === '/') {
        setBackPressCount(prev => prev + 1);
        setShowExitPrompt(true);
        
        setTimeout(() => {
          setBackPressCount(0);
          setShowExitPrompt(false);
        }, 2000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  useEffect(() => {
    if (backPressCount >= 2 && showExitPrompt) {
      if (confirm('Do you want to exit the app?')) {
        window.close();
        if (window.history.length > 1) {
          window.history.back();
        }
      }
      setBackPressCount(0);
      setShowExitPrompt(false);
    }
  }, [backPressCount, showExitPrompt]);

  return showExitPrompt && backPressCount === 1 ? (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
      Press back again to exit
    </div>
  ) : null;
}

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <BackButtonHandler />
          <AppRoutes />
        </BrowserRouter>
      </I18nextProvider>
    </DarkModeContext.Provider>
  );
}

export default App;
