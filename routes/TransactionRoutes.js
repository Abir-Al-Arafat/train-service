const express = require("express");
const routes = express();
const TransactiontController = require("../controller/TransactionController");
const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");

// gets all data
// routes.get("/", isAuthorized, TransactiontController.getAll);
routes.get("/", TransactiontController.getAll);

// adds data
routes.post("/create/:id", isAuthorizedUser, TransactiontController.create);
// routes.post(
//   "/create/",
//   // isAuthorizedUser,
//   TransactiontController.create
// );

module.exports = routes;
