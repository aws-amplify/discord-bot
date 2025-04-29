import { defineAuth, secret } from "@aws-amplify/backend";

import dotenv from "dotenv";
dotenv.config();

export const auth = defineAuth({
  loginWith: {
    email: true,

    externalProviders: {
      oidc: [
        {
          name: "Federate",
          clientId: secret(""),
          clientSecret: secret(""),
          issuerUrl: process.env.AUTH_ISSUER_URL,
          attributeMapping: {
            email: "EMAIL",
          },
        },
      ],
      callbackUrls: JSON.parse(process.env.AUTH_CALLBACK_URLS), //["http://localhost:5173/admin"],
      logoutUrls: JSON.parse(process.env.AUTH_LOGOUT_URLS),
    },
  },
});
