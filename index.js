const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;
const dotenv = require("dotenv");

dotenv.config();
const user = require("./controllers/userController");
app.use(express.json());
app.use(cors());
app.listen(port, () => {
  console.log(`API dziala na http://localhost:${port}.`);
});
app.use(bodyParser.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});
app.use("/api/user", user);
