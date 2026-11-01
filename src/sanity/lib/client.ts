import { createClient, type SanityClient } from "next-sanity";
import { isSanityConfigured, sanityApiVersion, sanityDataset, sanityProjectId } from "@/lib/env";

/**
 * Read client. `useCdn: false` because results are cached by Next.js ('use cache')
 * and refreshed by the Sanity webhook, so we always want fresh data on revalidation.
 * A read token (server-only) is attached by `getReadClient` when the dataset is private.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiVersion: sanityApiVersion,
      useCdn: false,
      perspective: "published",
    })
  : null;
