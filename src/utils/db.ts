import sqlite3 from "sqlite3";
import { open, Database as SQLiteDatabase } from "sqlite";
import path from "path";

export interface UserData {
  userId: number;
  wallet?: `0x${string}`;
  chain?: number;
  lastUpdate?: string;
}

let dbInstance: SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: path.join(__dirname, "../../bot.sqlite"),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId BIGINT PRIMARY KEY,
      wallet VARCHAR(20),
      chain BIGINT,
      lastUpdate TIMESTAMP DEFAULT NOW
    )
  `);

  return dbInstance;
}

export async function getUserData(
  userId: number,
): Promise<UserData | undefined> {
  const db = await initializeDatabase();
  return db.get<UserData>(
    "SELECT userId, wallet, chain, lastUpdate FROM users WHERE userId = ?",
    userId,
  );
}

export async function getUserChain(
  userId: number,
): Promise<number | undefined> {
  const db = await initializeDatabase();
  const result = await db.get(
    "SELECT chain FROM users WHERE userId = ?",
    userId,
  );

  return result?.chain;
}

export async function getUserWallet(
  userId: number,
): Promise<`0x${string}` | undefined> {
  const db = await initializeDatabase();
  const result = await db.get(
    "SELECT wallet FROM users WHERE userId = ?",
    userId,
  );

  return result?.wallet;
}

export async function setUserData(userData: UserData): Promise<void> {
  const db = await initializeDatabase();
  const existingUser = await db.get(
    `SELECT * FROM users WHERE userId = ?`,
    userData.userId,
  );

  if (existingUser) {
    const updatedWallet = userData?.wallet
      ? userData.wallet
      : existingUser.wallet;
    const updatedChain = userData?.chain ? userData.chain : existingUser.chain;
    const updatedLastUpdate = userData?.lastUpdate || Date.now();

    await db.run(
      `UPDATE users SET wallet = ?, chain = ?, lastUpdate = ? WHERE userId = ?`,
      updatedWallet,
      updatedChain,
      updatedLastUpdate,
      userData.userId,
    );
  } else {
    await db.run(
      `INSERT INTO users (userId, wallet, chain, lastUpdate) 
       VALUES (?, ?, ?, ?)`,
      userData.userId,
      userData.wallet,
      userData.chain,
      userData.lastUpdate || Date.now(),
    );
  }
}
