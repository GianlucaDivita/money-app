import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface CurrencyContextValue {
  currency: string;
  locale: string;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  format: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState(() =>
    localStorage.getItem('budgetlens-currency') || 'USD'
  );
  const [locale, setLocaleState] = useState(() =>
    localStorage.getItem('budgetlens-locale') || 'en-US'
  );

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    localStorage.setItem('budgetlens-currency', c);
  }, []);

  const setLocale = useCallback((l: string) => {
    setLocaleState(l);
    localStorage.setItem('budgetlens-locale', l);
  }, []);

  const format = useCallback(
    (amount: number) =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount),
    [currency, locale]
  );

  return (
    <CurrencyContext.Provider value={{ currency, locale, setCurrency, setLocale, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}
