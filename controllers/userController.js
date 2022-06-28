const router = require("express").Router();
const verify = require("../authentication/veryfiToken");
const {
  register,
  login,
  changePassword,
  getEmail,
  deleteAccount,
} = require("../model/userModel.js");
//------------------------------------------ rejestracja uzytkownika ------------------------------------------

router.post("/register", async (request, response) => {
  const data = await register(request);
  response.status(data.status).json(data.message);
});
//------------------------------------------ logowanie uzytkownika ------------------------------------------

router.post("/login", async (request, response) => {
  const data = await login(request);
  data.hasOwnProperty("token")
    ? response.header("auth-token", data.token).send(data.token)
    : response.status(data.status).json(data.message);
});
//------------------------------------------ usuniecie uzytkownika ------------------------------------------

router.post("/deleteAccount", verify, async (request, response) => {
  const data = await deleteAccount(request);
  data === "error"
    ? response.status(500).json("error")
    : response.status(200).json(data);
});
//------------------------------------------ zaktualizowanie hasla dla uzytkownika ------------------------------------------

router.post("/changePassword", verify, async (request, response) => {
  const data = await changePassword(request);
  data.hasOwnProperty("status")
    ? response.status(data.status).json(data.message)
    : response.status(500).json("error");
});
//------------------------------------------ zaktualizowanie emaila dla uzytkownika ------------------------------------------

router.get("/getEmail", verify, async (request, response) => {
  const data = await getEmail(request);
  data === "error"
    ? response.status(500).json("error")
    : response.status(200).json(data);
});

module.exports = router;
