import { Table } from '@radix-ui/themes';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface StakeBTCItem {
  name: string;
  btcPk: string;
  totalDelegation: number;
  commission: string;
}

const StakeBTC: React.FC = () => {
  const navigate = useNavigate();

  const items: StakeBTCItem[] = [
    { name: 'Validator 1', btcPk: 'key1', totalDelegation: 1000, commission: '5%' },
    { name: 'Validator 2', btcPk: 'key2', totalDelegation: 2000, commission: '3%' },
    { name: 'Validator 3', btcPk: 'key3', totalDelegation: 1500, commission: '4%' },
  ];

  const handleRowClick = (btcPk: string) => {
    navigate(`/stake/btc/${btcPk}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">BTC Staking</h1>
      <Table.Root className="w-full max-w-4xl">
        <Table.Header>
          <Table.Row className="bg-gray-200">
            <Table.ColumnHeaderCell className="px-4 py-2">Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-4 py-2">BTC PK</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-4 py-2">Total Delegation</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell className="px-4 py-2">Commission</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items.map((item) => (
            <Table.Row
              key={item.btcPk}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => handleRowClick(item.btcPk)}
            >
              <Table.Cell className="px-4 py-2">{item.name}</Table.Cell>
              <Table.Cell className="px-4 py-2">{item.btcPk}</Table.Cell>
              <Table.Cell className="px-4 py-2">{item.totalDelegation}</Table.Cell>
              <Table.Cell className="px-4 py-2">{item.commission}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default StakeBTC;
