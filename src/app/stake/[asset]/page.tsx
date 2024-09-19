export default function StakeAssetDetailsPage({
  params,
}: {
  params: { asset: string };
}) {
  return <h1>Stake {params.asset}</h1>;
}
