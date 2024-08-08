import React, { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC'];

const formatCrypto = (value, decimals = 2) => {
  return parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="w-64 bg-gray-800 text-white p-6 space-y-4">
    <h2 className="text-sm font-semibold text-gray-400 mb-4">YIELD STREAMING</h2>
    {['Stake', 'Analytics', 'Integrations', 'Claim Yield', 'Swap Tokens', 'AVS'].map((item) => (
      <button
        key={item}
        className={`w-full text-left p-2 rounded transition-colors ${
          activeTab === item ? 'bg-blue-600' : 'hover:bg-gray-700'
        }`}
        onClick={() => setActiveTab(item)}
      >
        {item}
      </button>
    ))}
  </div>
);

const StakeForm = ({ activeAsset, setActiveAsset }) => {
  const [amount, setAmount] = useState('');
  const [yieldOption, setYieldOption] = useState('Native');

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Stake</h2>
        <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Secure</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>APY: 5.5%</span>
        <span>Total Value Locked: $30,000,000,000</span>
      </div>
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 p-2 rounded">Stake</button>
        <button className="flex-1 bg-gray-700 p-2 rounded">Unstake</button>
        <button className="flex-1 bg-gray-700 p-2 rounded">Withdraw</button>
      </div>
      <div className="relative">
        <select
          value={activeAsset}
          onChange={(e) => setActiveAsset(e.target.value)}
          className="w-full bg-gray-700 p-2 rounded appearance-none"
        >
          {ASSETS.map((asset) => (
            <option key={asset} value={asset}>{asset}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2" />
      </div>
      <div className="flex justify-between bg-gray-700 rounded p-2">
        <button
          className={`flex-1 rounded p-1 ${yieldOption === 'Native' ? 'bg-blue-600' : ''}`}
          onClick={() => setYieldOption('Native')}
        >
          Native
        </button>
        <button
          className={`flex-1 rounded p-1 ${yieldOption === 'Preferred' ? 'bg-blue-600' : ''}`}
          onClick={() => setYieldOption('Preferred')}
        >
          Preferred Asset
        </button>
      </div>
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          className="w-full bg-gray-700 p-2 rounded"
        />
        <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-400">MAX</button>
      </div>
      <div className="text-sm">
        <p>Exchange rate: 1 s{activeAsset} = 1.02 {activeAsset}</p>
        <p>You will receive: {formatCrypto(amount * 1.02)} s{activeAsset}</p>
      </div>
      <button className="w-full bg-blue-600 p-2 rounded font-semibold">Stake</button>
      <div className="space-y-2">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: '80%' }}></div>
        </div>
        <div className="flex justify-between text-sm">
          <span>Staking limit</span>
          <span>800,000 / 1,000,000 {activeAsset}</span>
        </div>
      </div>
    </div>
  );
};

const Stats = () => (
  <div className="bg-gray-800 rounded-lg p-6 space-y-4">
    <h2 className="text-xl font-semibold">Yieldi Stats</h2>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-gray-400">Total Value Locked</p>
        <p className="text-2xl font-bold">$30B</p>
      </div>
      <div>
        <p className="text-gray-400">Total Yield Generated</p>
        <p className="text-2xl font-bold">$500M</p>
      </div>
      <div>
        <p className="text-gray-400">Active Users</p>
        <p className="text-2xl font-bold">100K</p>
      </div>
    </div>
    <h3 className="text-lg font-semibold mt-4">Assets Staked</h3>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>BTC</span>
        <span>800,000</span>
      </div>
      <div className="flex justify-between">
        <span>ETH</span>
        <span>5,000,000</span>
      </div>
      <div className="flex justify-between">
        <span>SOL</span>
        <span>100,000,000</span>
      </div>
    </div>
  </div>
);

const YieldChart = () => {
  const data = [
    { name: 'Jan', yield: 4000 },
    { name: 'Feb', yield: 3000 },
    { name: 'Mar', yield: 5000 },
    { name: 'Apr', yield: 4500 },
    { name: 'May', yield: 6000 },
    { name: 'Jun', yield: 5500 },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Yield Performance</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip />
          <Line type="monotone" dataKey="yield" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const YieldiApp = () => {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('Stake');
  const [activeAsset, setActiveAsset] = useState('BTC');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900';
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Yieldi</h1>
        <div className="flex items-center space-x-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2">
            {theme === 'dark' ? <Sun /> : <Moon />}
          </button>
        </div>
      </header>
      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 space-y-8">
          <Alert>
            <AlertDescription>
              Welcome to Yieldi! Start staking your assets to earn yield.
            </AlertDescription>
          </Alert>
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <StakeForm activeAsset={activeAsset} setActiveAsset={setActiveAsset} />
            </div>
            <Stats />
          </div>
          <YieldChart />
        </main>
      </div>
      <footer className="bg-gray-800 p-4 text-center text-sm">
        <a href="https://yieldi.xyz" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
          Visit Yieldi.xyz <ExternalLink className="ml-1" size={14} />
        </a>
      </footer>
    </div>
  );
};

export default YieldiApp;