import { Card } from "@radix-ui/themes";
import React from "react";

import { FinalityProvider } from "@/app/types/finalityProviders";

interface MobileFinalityProviderCardProps {
  provider: FinalityProvider;
  handleSelectProvider: (provider: FinalityProvider) => void;
}

const MobileFinalityProviderCard: React.FC<MobileFinalityProviderCardProps> = ({
  provider,
  handleSelectProvider,
}) => (
  <div className="mb-4 bg-white border-yieldi-gray-200 border">
    <div className="grid grid-cols-5 text-left">
      <Card variant="ghost" className="col-span-3 rounded-none p-6">
        <h3 className="text-yieldi-brown text-xl font-medium mb-1 truncate">
          {provider.description.moniker || "Unknown"}
        </h3>
        <span className="text-yieldi-brown-light text-xs font-mono">
          {provider.btcPk.slice(0, 5)}...{provider.btcPk.slice(-5)}
        </span>
      </Card>
      <div className="rounded-none border-yieldi-gray-200 border-l-2 p-4 col-span-2">
        <p className="text-yieldi-brown-light text-xs uppercase">My Stake</p>
        <p className="text-yieldi-brown text-lg font-medium">0.00 BTC</p>
      </div>
    </div>
    <div className="grid grid-cols-5 mb-4 border-yieldi-gray-200 border-y-2">
      <Card variant="ghost" className="col-span-3 rounded-none p-6">
        <p className="text-yieldi-brown-light text-xs uppercase">
          Total Delegation
        </p>
        <p className="text-yieldi-brown text-lg font-medium">
          {provider.totalDelegations} BTC
        </p>
      </Card>
      <div className="rounded-none border-l-2 border-yieldi-gray-200 p-4 col-span-2">
        <p className="text-yieldi-brown-light text-xs uppercase">
          Commission
        </p>
        <p className=" text-yieldi-brown text-lg font-medium">
          {provider.commission
            ? `${(Number(provider.commission) * 100).toFixed(0)}%`
            : "-"}
        </p>
      </div>
    </div>
    <div className="px-5">
      <button
        onClick={() => handleSelectProvider(provider)}
        className="flex w-full rounded-[4px] p-[10px_21px] justify-center items-center 
          gap-[10px] flex-[1_0_0] bg-yieldi-brown text-white text-sm font-medium my-4 uppercase"
      >
        Select Provider
      </button>
    </div>
  </div>
);

interface MobileFinalityProvidersViewProps {
  finalityProviders: FinalityProvider[];
  handleSelectProvider: (provider: FinalityProvider) => void;
}

const MobileFinalityProvidersView: React.FC<
  MobileFinalityProvidersViewProps
> = ({ finalityProviders, handleSelectProvider }) => (
  <div className="md:hidden">
    {finalityProviders?.map((provider) => (
      <MobileFinalityProviderCard
        key={provider.btcPk}
        provider={provider}
        handleSelectProvider={handleSelectProvider}
      />
    ))}
  </div>
);

export default MobileFinalityProvidersView;
