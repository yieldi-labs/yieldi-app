import React from 'react';
import { useParams } from 'react-router-dom';

const BtcPubKeyDetail: React.FC = () => {
  const { btcpk } = useParams<{ btcpk: string }>();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">BTC Staking Details</h1>
      <p className="mt-5">Public Key: {btcpk}</p>
    </div>
  );
};

export default BtcPubKeyDetail;
