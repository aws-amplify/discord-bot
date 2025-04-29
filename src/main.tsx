import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.tsx";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
// import config from "@/../amplifyconfiguration.json";
import config from "../amplify_outputs.json";
import SiteHeader from "@/components/Header";
import { generateClient } from "aws-amplify/data";

export const tanstackQueryClient = new QueryClient();
import type { Schema } from "@/../amplify/data/resource";
// import { AuthenticationWrapper } from "@/components/AuthenticationWrapper";
import "@aws-amplify/ui-react/styles.css";
import { BrowserRouter } from "react-router";
import { Authenticator } from "@aws-amplify/ui-react";

console.log(config);
Amplify.configure(config);

const initConfig = Amplify.getConfig();

console.log({ initConfig });

Amplify.configure({
  ...initConfig,
  API: {
    ...initConfig.API,
    REST: {
      discordBotApiEnpoint: {
        endpoint: config.custom.discordBotRestAPIEndpoint,
      },
    },
  },
});

export const amplifyClient = generateClient<Schema>();

console.log(Amplify.getConfig());
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Authenticator.Provider>
        <QueryClientProvider client={tanstackQueryClient}>
          <SiteHeader />
          <App />
        </QueryClientProvider>
      </Authenticator.Provider>
    </BrowserRouter>
  </React.StrictMode>
);
