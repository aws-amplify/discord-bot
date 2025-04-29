import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { default as fetch, Request } from "node-fetch";

const { Sha256 } = crypto;
const GRAPHQL_ENDPOINT =
  (process.env.APPSYNC_GRAPHQL_ENDPOINT as string) ||
  "https://tw4r2rj6anekdjnoh4ixmx5si4.appsync-api.us-east-1.amazonaws.com/graphql";
const AWS_REGION = "us-east-1";

type RequestHandlerInput = {
  query: string;
  variables: Record<"input", Input>;
  //Input; //Record<>
};

type Input = Record<string, string | string[] | unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requestHandler = async (
  payload: RequestHandlerInput
): Promise<any> => {
  const endpoint = new URL(GRAPHQL_ENDPOINT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify({
      query: payload.query,
      variables: payload.variables,
    }),
    path: endpoint.pathname,
  });

  console.log("Signing request");
  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(GRAPHQL_ENDPOINT, signed);

  try {
    console.log("Attempting request");
    const result = await fetch(request);
    const body = await result.json();
    console.log(body);
    return body;
  } catch (e) {
    console.log("Request error", e);
    throw e;
  }
};
