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
          clientId: secret("FEDERATE_CLIENT"),
          clientSecret: secret("FEDERATE_SECRET"),
          issuerUrl: process.env.ISSUER_URL,
          attributeMapping: {
            email: "EMAIL",
          },
        },
      ],
      callbackUrls: JSON.parse(process.env.CALLBACK_URLS),
      logoutUrls: JSON.parse(process.env.LOGOUT_URLS),
    },
  },
});
