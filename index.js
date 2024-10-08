const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

const databaseConnection = require("./config/database");

const TransactionRouter = require("./routes/TransactionRoutes");
const UserRouter = require("./routes/UserRoutes");
const AuthRouter = require("./routes/AuthRoutes");
const StationRouter = require("./routes/StationRoutes");
const TrainRouter = require("./routes/TrainRoutes");
const TicketRouter = require("./routes/TicketRoutes");
const WalletRouter = require("./routes/WalletRoutes");

const app = express();

dotenv.config();

// const corsOptions = {
//     origin: "http://localhost:5173",
//     credentials: true,
// };

// app.use(cors(corsOptions));

app.use(cors({ origin: "*" }));

app.use(express.json()); // Parses data as JSON
app.use(express.text()); // Parses data as text
// app.use(express.urlencoded({ extended: true })); // Parses data as urlencoded

// checks invalid json file
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({ message: "invalid json file" });
  }
  next();
});

const PORT = 3000;

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "/server/access.log"),
  { flags: "a" }
);

// Use morgan with a combined format and stream it to the access log file
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/transactions", TransactionRouter);
app.use("/users", UserRouter);
app.use("/users", AuthRouter);

app.use("/stations", StationRouter);
app.use("/trains", TrainRouter);
app.use("/tickets", TicketRouter);
app.use("/wallets", WalletRouter);

// Route to handle all other invalid requests
app.use((req, res) => {
  return res.status(400).send({ message: "Route doesnt exist" });
});

databaseConnection(() => {
  app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
  });
});
