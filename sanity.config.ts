"use client";

/**
 * Sanity Studio configuration — mounted at /studio.
 * Admin access is controlled by Sanity project membership and roles
 * (manage at https://www.sanity.io/manage). See README > CMS & admin.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes, SINGLETONS, SYSTEM_CREATED } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./src/lib/env";

export default defineConfig({
  name: "s2holidays",
  title: "S2 Holidays",
  basePath: "/studio",
  projectId: sanityProjectId || "missing",
  dataset: sanityDataset,
  schema: {
    types: schemaTypes,
    // Hide singletons and website-created leads from the global "Create" menu
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType) && !SYSTEM_CREATED.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) => {
      if (SINGLETONS.includes(schemaType)) {
        return actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action));
      }
      if (SYSTEM_CREATED.includes(schemaType)) {
        return actions.filter(({ action }) => action !== "duplicate");
      }
      return actions;
    },
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: sanityApiVersion })],
});
