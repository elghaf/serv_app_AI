import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Create/open SQLite database
export async function getDb() {
  return open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
}