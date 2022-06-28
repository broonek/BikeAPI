const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  host: "localhost", 
  database: "postgres",
  password: "d6Hue#AJz?-F92pX",
  port: 5432, // zmienic na domyslny
});

module.exports = pool;
