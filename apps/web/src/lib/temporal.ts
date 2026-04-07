import { Connection, Client } from "@temporalio/client";

export async function getTemporalClient(): Promise<{ client: Client; connection: Connection }> {
  const connection = await Connection.connect({
    address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233",
  });
  const client = new Client({ connection });
  return { client, connection };
}
