import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [
    inferAdditionalFields<Auth>(),
    twoFactorClient({ twoFactorPage: "/admin/login/two-factor" }),
  ],
});
