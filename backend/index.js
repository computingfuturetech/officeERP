require("./src/config/config");
const app = require("./app");
const createFirstAdmin = require("./src/scripts/createFirstAdmin.script");

const port = process.env.PORT || 3000;
const ip = process.env.IP || "127.0.0.1";

app.listen(port, ip, () => {
  console.log(`Server is running at http://${ip}:${port}`);
  createFirstAdmin();
});
