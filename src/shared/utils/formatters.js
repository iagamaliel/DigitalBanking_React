
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("es-SV", {
  dateStyle: "medium",
});

export const formatMoney = (value) => {
  const amount = Number(value);

  if (value == null || value === "" || !Number.isFinite(amount)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(amount);
};

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return dateFormatter.format(date);
};
