module.exports = function generateRandomNumber(from, to) {
  return Math.floor(from + Math.random() * (to - from + 1));
}