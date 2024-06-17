import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const pool = new Pool({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: Number(DB_PORT!),
  database: DB_NAME,
  // ssl: true,
});
const query = (text: string, params?: any[]) => pool.query(text, params);
const db = { query };
export default db;
