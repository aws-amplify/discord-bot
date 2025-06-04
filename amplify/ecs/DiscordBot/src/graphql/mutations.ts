/** QUESTION MODEL ==================== */

export const ADD_QUESTION_MUTATION = /* GraphQL */ `
  mutation AddQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
    }
  }
`;

export const UPDATE_QUESTION_MUTATION = /* GraphQL */ `
  mutation UpdateQuestion($input: UpdateQuestionInput!) {
    updateQuestion(input: $input) {
      id
    }
  }
`;

export const DELETE_QUESTION_MUTATION = /* GraphQL */ `
  mutation AddQuestion($input: DeleteQuestionInput!) {
    deleteQuestion(input: $input) {
      id
    }
  }
`;

/** USER MODEL ==================== */
export const CREATE_USER_MUTATION = /* GraphQL */ `
  mutation CreateUser($input: CreateDiscordUserInput!) {
    createDiscordUser(input: $input) {
      id
    }
  }
`;

export const UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation UpdateUser($input: UpdateDiscordUserInput!) {
    updateDiscordUser(input: $input) {
      id
    }
  }
`;
