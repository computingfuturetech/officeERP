export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const cleanParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v != null)
  );
};
