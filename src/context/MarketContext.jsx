import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchLiveStocks } from '../services/alphaVantageService';

const MarketContext = createContext({ isBull: true, loading: true, data: null });
export const useMarket = () => useContext(MarketContext);

export function MarketProvider({ children }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const get = async () => {
            try {
                const { sentiment } = await fetchLiveStocks();
                setData({ status: sentiment.status, percentage: sentiment.percentage });
            } catch {
                setData({ status: 'BULLISH', percentage: '1.25' });
            } finally {
                setLoading(false);
            }
        };

        get();
        // Refresh every 5 min — aligns with shared service cache TTL
        const id = setInterval(get, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <MarketContext.Provider value={{ data, loading, isBull: data?.status === 'BULLISH' }}>
            {children}
        </MarketContext.Provider>
    );
}
