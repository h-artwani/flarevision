import { Connection, Client } from "@temporalio/client";

export async function getTemporalClient(): Promise<{ client: Client; connection: Connection }> {
  const isCloud = !!process.env.TEMPORAL_API_KEY;

  const connection = await Connection.connect(
    isCloud
      ? {
          address: process.env.TEMPORAL_ADDRESS!,
          tls: true,
          metadata: { "temporal-namespace": process.env.TEMPORAL_NAMESPACE! },
          apiKey: process.env.TEMPORAL_API_KEY!,
        }
      : { address: process.env.TEMPORAL_ADDRESS ?? "localhost:7233" }
  );

  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE ?? "default",
  });

  return { client, connection };
}
