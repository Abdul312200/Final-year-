import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { fetchLiveStocks, FALLBACK_STOCKS } from '../services/alphaVantageService';

const useStockTicker = () => {
  const [stocks, setStocks] = useState(FALLBACK_STOCKS);
  const [live,   setLive  ] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { stocks: s, live: l } = await fetchLiveStocks();
      if (!cancelled) { setStocks(s); setLive(l); }
    };

    load();
    const id = setInterval(load, 5 * 60 * 1000); // aligns with cache TTL
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { stocks, live };
};

const NewsTicker = () => {
  const { lang } = useLanguage();
  const { stocks, live } = useStockTicker();

  return (
    <div className="news-ticker-container">
      <div className="ticker-label">
        <span>{lang === 'en' ? 'LIVE MARKET' : 'நேரடி சந்தை'}</span>
        {live && <span className="ticker-live-dot" title="Live data">●</span>}
      </div>
      <div className="news-ticker">
        <div className="ticker-content">
          {[...stocks, ...stocks].map((stock, index) => (
            <div key={index} className={`ticker-item ${stock.type}`}>
              <span className="ticker-symbol">{stock.symbol}</span>
              <span className="ticker-price">₹{stock.price}</span>
              <span className={`ticker-change ${stock.type}`}>
                {stock.type === 'high' ? '▲' : '▼'} {stock.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
