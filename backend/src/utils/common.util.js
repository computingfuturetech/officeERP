const mongoose = require("mongoose");

function isValidDate(value) {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Formats date into dd-mm-yy
 */
function formatDateV1(date) {
  return new Date(date).toLocaleDateString("en-GB").replace(/\//g, "-");
}

function compareDates(date1, date2) {
  if (!isValidDate(date1) || !isValidDate(date1)) return null;
  const date1Ms = new Date(date1).getTime();
  const date2Ms = new Date(date2).getTime();

  if (date1Ms < date2Ms) return -1;
  if (date1Ms == date2Ms) return 0;
  if (date1Ms > date2Ms) return 1;
}

function areObjectIdsEqual(id1, id2) {
  if (!mongoose.isValidObjectId(id1) || !mongoose.isValidObjectId(id2))
    return null;
  const objectId1 = new mongoose.Types.ObjectId(id1);
  const objectId2 = new mongoose.Types.ObjectId(id2);
  return objectId1.equals(objectId2);
}

function formatAsPKRCurrency(amount) {
  return amount.toLocaleString("en-PK", {
    style: "currency",
    currency: "PKR",
    // minimumFractionDigits: 2,
    // maximumFractionDigits: 2,
  });
}

function getNestedValue(object, path) {
  let current = object;
  const keys = path.split(".");
  for (const key of keys) {
    if (current[key] == null) return undefined;
    current = current[key];  
  } 
  return current;
}

module.exports = {
  isValidDate,
  formatDateV1,
  compareDates,
  areObjectIdsEqual,
  formatAsPKRCurrency,
  getNestedValue,
};
