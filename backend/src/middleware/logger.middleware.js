module.exports = (req, _, next) => {
  const blue = "\x1b[34;1m";
  const green = "\x1b[32m";
  const reset = "\x1b[0m";

  console.log(`${blue}${req.method}${reset} ${green}${req.url}${reset}`);
  next();
};
