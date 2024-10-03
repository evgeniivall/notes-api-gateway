exports.jsend = function (res, httpStatus, status, payload, customProperties) {
  const success = status === "success";

  res.status(httpStatus).json({
    status: status,
    ...(customProperties && { ...customProperties }),
    ...(success && payload && { data: { ...payload } }),
    ...(!success && { message: payload }),
  });
};
