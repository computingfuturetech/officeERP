const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const router = require("./src/routes");
const loggerMiddleware = require("./src/middleware/logger.middleware");
const multerMiddleware = require("./src/middleware/multer.middleware");
const corsMiddleware = require("./src/middleware/cors.middleware");
const { rateLimiter } = require("./src/middleware/rateLimiter.middleware");

// Middlewares
app.use(loggerMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(multerMiddleware);
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api", router);

module.exports = app;
