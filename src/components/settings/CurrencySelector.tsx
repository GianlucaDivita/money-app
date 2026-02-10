import { useCurrency } from '../../context/CurrencyContext';
import { GlassCard } from '../shared/GlassCard';
import { GlassSelect } from '../shared/GlassSelect';

const currencies = [
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'BRL', name: 'Brazilian Real', locale: 'pt-BR' },
];

export function CurrencySelector() {
  const { currency, setCurrency, setLocale } = useCurrency();

  function handleChange(code: string) {
    const selected = currencies.find((c) => c.code === code);
    if (selected) {
      setCurrency(selected.code);
      setLocale(selected.locale);
    }
  }

  return (
    <GlassCard>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-5">
        Currency & Locale
      </h3>
      <GlassSelect
        label="Currency"
        value={currency}
        onChange={(e) => handleChange(e.target.value)}
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.name}
          </option>
        ))}
      </GlassSelect>
    </GlassCard>
  );
}
