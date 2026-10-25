/** Public build flag shared by metadata and browser-side analytics. */
export const isPreviewDeployment =
  process.env.NEXT_PUBLIC_DEPLOYMENT_STAGE === "preview";
