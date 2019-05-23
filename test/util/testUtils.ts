import { Connection, createConnection, getConnection } from "typeorm";

export async function createTestDatabaseConnection(entities: (string | Function)[]): Promise<Connection> {
  const testConnection: Connection = await createConnection({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    synchronize: true,
    logging: false,
    entities: entities
  });

  if (testConnection.isConnected)
    return testConnection;
  else
    throw new Error("Failed to create the testing database!");
}

export async function closeTestDatabaseConnection(): Promise<void> {
  await getConnection().close();
}

export async function reloadTestDatabaseConnection(): Promise<void> {
  await getConnection().synchronize(true);
}

export function initEnv(): void {
  process.env.SALT = "random";
  process.env.ITERATIONS = "30000";
  process.env.KEY_LENGTH = "32";
  process.env.DIGEST = "sha256";
  process.env.ENABLE_LOGGING = "0";
}