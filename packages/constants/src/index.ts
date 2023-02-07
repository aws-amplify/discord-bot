/**
 * Access levels define the levels of access a user can have to access certain parts of the frontend
 */
export const ACCESS_LEVELS = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CONTRIBUTOR: 'CONTRIBUTOR',
  MEMBER: 'MEMBER',
}

/**
 * Feature codes to be used with frontend and bot apps
 * @NOTE command "features" are defined server-side and sideloaded
 */
export const FEATURE_CODES = {
  GITHUB: 'GITHUB',
}

/**
 * Feature types describe the types of features we support
 * for example, a command is a bot feature
 * for example, an integration is a e2e feature
 */
export const FEATURE_TYPES = {
  COMMAND: 'COMMAND',
  INTEGRATION: 'INTEGRATION',
}
