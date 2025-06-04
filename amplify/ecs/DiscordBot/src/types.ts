export type RequestHandlerInput = {
  query: string;
  variables: Record<"input", Input> | Record<string, string>;
};

export type Input = Record<string, string | string[] | unknown>;

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
