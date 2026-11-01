import "server-only";
import { client } from "./client";
import { serverEnv } from "@/lib/server-env";

/** Client for server-side reads (adds the read token for private datasets). */
export function getReadClient() {
  if (!client) return null;
  return serverEnv.sanityReadToken ? client.withConfig({ token: serverEnv.sanityReadToken }) : client;
}

/** Client with write permissions — ONLY used by the enquiry API to store leads. */
export function getWriteClient() {
  if (!client || !serverEnv.sanityWriteToken) return null;
  return client.withConfig({ token: serverEnv.sanityWriteToken, perspective: "raw" });
}
