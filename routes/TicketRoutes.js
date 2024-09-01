const express = require("express");
const routes = express();
const TicketController = require("../controller/TicketController");
const {
  commonValidator,
  stationValidator,
} = require("../middleware/validation");

// const createValidation = require("../middleware/validation");
// const createValidationPartial = require("../middleware/validationPartial");

const { isAuthorized } = require("../middleware/authValidationJWT");

// routes.get("/getall", ProductController.getAllProducts);

// gets all data
routes.get("/all", TicketController.getAll);

// get one data
// routes.get("/:id", productValidator.delete, ProductController.getOne);
routes.get("/:id", commonValidator.mongoId, TicketController.getOne);

// deletes
routes.delete(
  "/:id",
  // isAuthorized,
  commonValidator.mongoId,
  TicketController.delete
);

// add
routes.post(
  "/add",
  // isAuthorized,
  //   stationValidator.create,
  TicketController.addOne
);

// partial update
routes.patch(
  "/:id",
  // isAuthorized,
  stationValidator.update,
  TicketController.update
);

// update
// routes.put('/:id', createValidation, ProductController.update)

module.exports = routes;
