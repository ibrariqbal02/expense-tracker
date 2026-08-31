/**
 * Formats a number as a USD currency string with commas and 2 decimal places.
 * e.g. 1234567.8 → "$1,234,567.80"
 */
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
