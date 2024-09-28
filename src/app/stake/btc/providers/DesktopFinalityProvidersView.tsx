import { Table } from "@radix-ui/themes";
import React from "react";

import { FinalityProvider } from "@/app/types/finalityProviders";
import { StakeAsset } from "@/app/types/stakeAsset";
import { satoshiToBtc } from "@/utils/btcConversions";
import { Formatter } from "@/utils/numberFormatter";
import { truncateMiddle } from "@/utils/strings";

interface DesktopFinalityProvidersViewProps {
  finalityProviders: FinalityProvider[];
  simplifiedDelegations: {
    finalityProviderPkHex: string;
    stakingValueSat: number;
  }[];
  asset: StakeAsset | undefined;
  handleSelectProvider: (provider: FinalityProvider) => void;
}

const DesktopFinalityProvidersView: React.FC<
  DesktopFinalityProvidersViewProps
> = ({
  finalityProviders,
  simplifiedDelegations,
  asset,
  handleSelectProvider,
}) => {
  return (
    <Table.Root className="hidden md:block">
      <Table.Header className="[--table-row-box-shadow:none]">
        <Table.Row>
          <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider flex self-stretch text-yieldi-brown-light text-xs font-light">
            Provider
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
            My Stake
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
            Total Delegation
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light text-center">
            Commission
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell className="px-6 py-3 uppercase tracking-wider text-yieldi-brown-light text-xs font-light">
            Actions
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body className="space-y-1.5">
        {finalityProviders?.map((provider: FinalityProvider, index: number) =>
          index % 2 == 0 ? (
            <Table.Row
              key={provider.btcPk}
              className="mb-[5px] items-start gap-2.5 w-full border border-yieldi-gray-200 bg-white [--table-row-box-shadow:none]"
            >
              <Table.Cell className="pl-6 py-4 whitespace-nowrap">
                <div className="text-yieldi-brown text-xl font-medium">
                  {provider.providerType === "thorchain"
                    ? provider.description.moniker
                    : provider.description.moniker || "Unknown"}
                </div>
                <div className="text-yieldi-brown-light font-gt-america-mono text-sm font-normal">
                  {truncateMiddle(provider.btcPk, 5)}
                </div>
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap">
                {(() => {
                  const delegation = simplifiedDelegations.find(
                    (d) => d.finalityProviderPkHex === provider.btcPk,
                  );

                  if (delegation) {
                    return (
                      <>
                        <div className="text-yieldi-brown text-xl font-normal">
                          {`$ ${Formatter.format(
                            satoshiToBtc(delegation.stakingValueSat) *
                              (asset?.price || 0),
                          )}`}
                        </div>
                        <div className="text-yieldi-brown-light text-sm font-normal">
                          {`${satoshiToBtc(delegation.stakingValueSat)} BTC`}
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="text-yieldi-brown text-xl font-normal">
                          $0.00
                        </div>
                        <div className="text-yieldi-brown-light text-sm font-normal">
                          0.0 BTC
                        </div>
                      </>
                    );
                  }
                })()}
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap">
                <div className="text-yieldi-brown text-xl font-normal">
                  {`$ ${Formatter.format(provider.totalDelegations * (asset?.price || 0))}`}
                </div>
                <div className="text-yieldi-brown-light text-sm font-normal">
                  {provider.totalDelegations} BTC
                </div>
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap align-middle">
                <div className="text-yieldi-brown text-xl font-normal text-center">
                  {provider.providerType === "thorchain"
                    ? "N/A"
                    : provider.commission
                      ? `${(Number(provider.commission) * 100).toFixed(0)}%`
                      : "-"}
                </div>
              </Table.Cell>
              <Table.Cell className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleSelectProvider(provider)}
                  className="flex justify-center items-center w-[152px] h-[38px] px-[21px] py-[10px] 
                    gap-[10px] shrink-0 rounded bg-yieldi-brown text-yieldi-beige text-sm font-medium"
                >
                  SELECT
                </button>
              </Table.Cell>
            </Table.Row>
          ) : (
            <Table.Row
              key={provider.btcPk}
              className="w-full h-[6px] border-none shadow-none"
            ></Table.Row>
          ),
        )}
      </Table.Body>
    </Table.Root>
  );
};

export default DesktopFinalityProvidersView;
