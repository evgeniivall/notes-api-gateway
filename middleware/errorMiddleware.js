const { jsend } = require("../utils/utils");

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    jsend(res, err.statusCode, err.status, err.message, {
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      jsend(res, err.statusCode, err.status, err.message);
    } else {
      jsend(res, 500, "error", "Something went wrong!");
    }
  } else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.isOperational ? err.message : "Please try again later!",
    });
  }
  console.log("ERROR:", err);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, name: err.name, message: err.message };

    sendErrorProd(error, req, res);
  }
  next();
};
