import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@smithy/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { default as fetch, Request } from "node-fetch";

const { Sha256 } = crypto;
const GRAPHQL_ENDPOINT = process.env.APPSYNC_GRAPHQL_ENDPOINT as string;
const AWS_REGION = "us-east-1";

export enum REQUEST_TYPE {
  THREAD_CREATE = "THREAD_CREATE",
  THREAD_DELETE = "THREAD_DELETE",
  THREAD_UPDATE = "THREAD_UPDATE",
  THREAD_UPDATE_RETRY = "THREAD_UPDATE_RETRY",
  ANSWER_SELECTED = "ANSWER_SELECTED",
  GENERATE_ANSWER = "GENERATE_ANSWER",
  GET_USER = "GET_USER",
  CREATE_USER = "CREATE_USER",
  UPDATE_USER = "UPDATE_USER",
}

type RequestHandlerInput = {
  query: string;
  variables: Record<"input", Input> | Record<string, string>;
};

type Input = Record<string, string | string[] | unknown>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requestHandler = async (
  payload: RequestHandlerInput,
  type: REQUEST_TYPE
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
    console.log(`s-${type}=====================`);
    console.log(body);
    console.log(`e-${type}=====================`);
    return body;
  } catch (e) {
    console.log("Request error", e);
    throw e;
  }
};
