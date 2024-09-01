const express = require("express");
const routes = express();
const WalletController = require("../controller/WalletController");

const {
  isAuthorized,
  isAuthorizedUser,
} = require("../middleware/authValidationJWT");

// gets all data
routes.get("/all", isAuthorized, WalletController.getAll);

// get one data
routes.get("/:id", isAuthorizedUser, WalletController.getOne);

module.exports = routes;
