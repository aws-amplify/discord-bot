import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Amplify } from "aws-amplify";
import config from "../amplify_outputs.json";
import SiteHeader from "./components/Header";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
export const tanstackQueryClient = new QueryClient();
import { BrowserRouter } from "react-router";

Amplify.configure(config);

export const amplifyClient = generateClient<Schema>();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={tanstackQueryClient}>
        <SiteHeader />
        <App />
        <div className="min-h-56 bg-slate-200 flex justify-center items-center mt-24">
          {new Date().getFullYear()} AWS Amplify Discord Bot
        </div>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
