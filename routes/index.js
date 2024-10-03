const axios = require("axios");
const path = require("path");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  accessControlMiddleware,
} = require("../middleware/accessControlMiddleware");
const loadJSON = require("../utils/loadJSON");
const AppError = require("../utils/appError");

function createRouteHandler(route) {
  return async (req, res, next) => {
    try {
      const response = await axios({
        method: req.method,
        url: `${route.serviceUrl}${req.originalUrl}`,
        headers: { "Content-Type": req.headers["content-type"] },
        data: req.body,
        timeout: process.env.REQUEST_TIMEOUT_MS || 5000,
      });
      res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        // The request was made, and the server responded with an error status code
        res.status(error.response.status).json(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        next(
          new AppError("Service Unavailable - No response from service", 504)
        );
      } else {
        // Something went wrong while setting up the request
        next(error);
      }
    }
  };
}

function configureRoutes(app) {
  const routes = loadJSON(path.join(__dirname, "../config/routes.json"));

  routes.forEach((route) => {
    const routeHandler = createRouteHandler(route);

    if (route.public) {
      // Public route, no auth or access control
      app[route.method.toLowerCase()](route.path, routeHandler);
    } else {
      // Protected route, apply auth and access control
      app[route.method.toLowerCase()](
        route.path,
        authMiddleware,
        accessControlMiddleware(route),
        routeHandler
      );
    }
  });
}

module.exports = configureRoutes;
