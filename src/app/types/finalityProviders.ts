export interface FinalityProvider {
  description: Description;
  commission: string;
  btcPk: string;
  activeTVLSat: number;
  totalTVLSat: number;
  activeDelegations: number;
  totalDelegations: number;
}

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  securityContact: string;
  details: string;
}
export interface FinalityProvidersContextType {
  finalityProviders: FinalityProvider[];
  setFinalityProviders: React.Dispatch<
    React.SetStateAction<FinalityProvider[]>
  >;
}
