import {createClient} from "next-sanity";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yclymbbl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-09-19",
  useCdn: true,
};

export const sanityClient = createClient(sanityConfig);
