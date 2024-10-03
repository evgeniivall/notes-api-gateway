const express = require("express");
const routes = require("./routes");
const errorMiddleware = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json());

// Load and initialize routes
routes(app);

app.use(errorMiddleware);

module.exports = app;
