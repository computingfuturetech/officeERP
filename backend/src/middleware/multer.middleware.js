const multer = require("multer");
const upload = multer();
const multerFileRoutes = require("../routes/multerFileRoutes");

module.exports = (req, res, next) => {
  for (const route of multerFileRoutes) {
    if (req.url.startsWith(route)) {
      next();
      return;
    }
  }
  upload.none()(req, res, next);
};