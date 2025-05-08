import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { discordRestAPIFunction } from "../functions/resource";
/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rules below
specify that owners, authenticated via your Auth resource can "create",
"read", "update", and "delete" their own records. Public users,
authenticated via an API key, can only "read" records.
=========================================================================*/
const schema = a.schema({
  Question: a
    .model({
      id: a.id().required(),
      title: a.string(),
      url: a.string(),
      answered: a.string().default("no").required(),
      answer: a.string(),
      tags: a.string(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.authenticated(),
      allow.guest().to(["read"]),
    ])
    .secondaryIndexes((index) => [index("answered")]),

  DiscordUser: a
    .model({
      answers: a.string().array(),
      name: a.string(),
    })
    .authorization((allow) => allow.authenticated()),

  serverStats: a
    .query()
    .returns(
      a.customType({
        members: a.integer(),
        presence: a.integer(),
        t: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated())
    .handler(a.handler.function(discordRestAPIFunction)),

  RAG: a.customType({ response: a.string(), citations: a.string().array() }),

  retrieveAndGenerate: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.ref("RAG"))
    .authorization((allow) => allow.publicApiKey())
    .handler(
      a.handler.custom({
        dataSource: "BedrockAgentDataSource",
        entry: "./resolvers/retrieveAndGenerate.js",
      })
    ),
  generateAnswer: a
    .query()
    .arguments({ prompt: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.publicApiKey()])
    .handler(
      a.handler.custom({
        dataSource: "BedrockDataSource",
        entry: "./resolvers/generateAnswer.js",
      })
    ),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  name: "DiscordBot",
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 2,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import { type Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
