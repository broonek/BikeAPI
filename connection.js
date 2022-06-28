const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "BIKE",
  password: "d6Hue#AJz?-F92pX",
  port: 5432, // zmienic na domyslny
});

module.exports = pool;
