import { useEffect, useState } from 'react';
import { setConsent } from '../services/analytics';

const CONSENT_KEY = 'analytics_consent';

type ConsentValue = 'granted' | 'denied';

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (value: ConsentValue) => {
    setVisible(false);
    void setConsent(value);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-gray-900/95 border-t border-gray-800 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-300">
          <span className="font-semibold text-white">Analytics consent:</span>{' '}
          We only collect anonymous usage to count active users. No ads, no selling data.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleChoice('denied')}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice('granted')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
