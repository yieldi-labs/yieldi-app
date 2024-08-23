export const truncateMiddle = (str: string, padding: number) => {
  return str.length <= padding * 2
    ? str
    : str.slice(0, padding) + "…" + str.slice(-1 * padding);
};
