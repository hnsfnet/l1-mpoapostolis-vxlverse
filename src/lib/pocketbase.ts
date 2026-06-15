import PocketBase from "pocketbase";

// Initialize PocketBase
export const pb = new PocketBase("https://api.vxlverse.com");

// Export types for better TypeScript support
export type AuthModel = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};
