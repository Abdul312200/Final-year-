import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MarketProvider } from './context/MarketContext';

// Component Imports
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MarketIndicator from './components/MarketIndicator';
/*import QuickAccess from './components/QuickAccess';*/
import Chatbot from './components/Chatbot';
import NewsTicker from './components/NewsTicker';

// Page Imports
import StockPrediction from './pages/StockPrediction';
import Learn from './pages/Learn';
import LearnCourse from './pages/LearnCourse';
import Tools from './pages/Tools';

import EMICalculator from './pages/tools/EMICalculator';
import SIPCalculator from './pages/tools/SIPCalculator';
import CompoundInterestCalculator from './pages/tools/CompoundInterestCalculator';

/**
 * The main application component.
 * Manages routing and global state, such as the visibility of the chatbot.
 */
export default function App() {
  // State to control whether the chatbot window is open or closed.
  const [chatOpen, setChatOpen] = useState(false);

  // Toggles the chatbot visibility. Passed to the Navbar button.
  const handleChatToggle = () => {
    setChatOpen(prev => !prev);
  };

  // Explicitly closes the chatbot. Passed to the Chatbot's internal close button.
  const handleChatClose = () => {
    setChatOpen(false);
  };

  return (
    <MarketProvider>
      <Navbar onChatToggle={handleChatToggle} chatOpen={chatOpen} />
      <main className="main-content">
        <Routes>
          {/* Main dashboard route */}
          <Route
            path="/"
            element={(
              <>
                <Hero />
                <MarketIndicator />

              </>
            )}
          />
          {/* Other pages */}
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/course/:slug" element={<LearnCourse />} />
          <Route path="/stock-prediction" element={<StockPrediction />} />
          <Route path="/tools" element={<Tools />} />

          <Route path="/tools/emi" element={<EMICalculator />} />
          <Route path="/tools/sip" element={<SIPCalculator />} />
          <Route path="/tools/compound" element={<CompoundInterestCalculator />} />
        </Routes>
      </main>
      <Chatbot open={chatOpen} onToggle={handleChatClose} />
      <NewsTicker />
    </MarketProvider>
  );
}
