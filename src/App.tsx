import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import BtcPubKeyDetail from './components/BtcPubKeyDetail';
import Home from './components/Home';
import StakeBTC from './components/StakeBtc';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stake/btc" element={<StakeBTC />} />
        <Route path="/stake/btc/:btcpk" element={<BtcPubKeyDetail />} />
      </Routes>
    </Router>
  );
};

export default App;
