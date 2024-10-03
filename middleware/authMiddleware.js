const axios = require("axios");
const AppError = require("../utils/appError");

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) throw new AppError("Token is missing", 401);

    const authResponse = await axios({
      method: "POST",
      url: `${process.env.AUTH_SERVICE_HOST}/api/v1/auth/introspect`,
      headers: { Authorization: token },
      data: null,
      timeout: process.env.REQUEST_TIMEOUT_MS || 5000,
    });

    // Set user context in the request
    req.user = authResponse.data.data;
    next();
  } catch (error) {
    if (error.response) {
      // The request was made, and the server responded with an error status code
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      next(
        new AppError("Service Unavailable - No response from auth service", 504)
      );
    } else {
      // Something went wrong while setting up the request
      next(error);
    }
  }
}

module.exports = { authMiddleware };
