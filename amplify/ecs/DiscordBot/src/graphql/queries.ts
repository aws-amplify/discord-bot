export const GET_USER_QUERY = /* GraphQL */ `
  query GetUser($id: ID!) {
    getDiscordUser(id: $id) {
      id
      answers
    }
  }
`;

/** BEDROCK */

export const RAG_QUERY = /* GraphQL */ `
  query RetrieveAndGenerate($prompt: String!) {
    retrieveAndGenerate(prompt: $prompt)
  }
`;
