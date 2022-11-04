export const ACCESS_LEVELS = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CONTRIBUTOR: 'CONTRIBUTOR',
  MEMBER: 'MEMBER',
}

/**
 * @NOTE command "features" are defined server-side and sideloaded
 */
export const FEATURE_CODES = {
  GITHUB: 'GITHUB',
}

export const FEATURE_TYPES = {
  COMMAND: 'COMMAND',
  INTEGRATION: 'INTEGRATION',
}

export const APP_COOKIE_BASE = 'hey-amplify'
export const GUILD_COOKIE = `${APP_COOKIE_BASE}.guild`
