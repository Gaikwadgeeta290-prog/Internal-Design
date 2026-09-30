import pool from "./config/db.js";

try {
  const [rows] = await pool.query("SELECT 1 AS database_connected");

  console.log("MySQL connected successfully!");
  console.log(rows);
} catch (error) {
  console.error("MySQL connection failed:");
  console.error(error.message);
} finally {
  await pool.end();
}