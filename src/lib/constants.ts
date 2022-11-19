export const AMPLIFY_ORANGE = '#ff9900'

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
  AUDIT_LOG: 'AUDIT_LOG',
}

export const FEATURE_TYPES = {
  /**
   * Discord Commands
   */
  COMMAND: 'COMMAND',
  /**
   * Integrations with third party services (i.e. not Discord)
   */
  INTEGRATION: 'INTEGRATION',
  /**
   * General built-in components
   */
  COMPONENT: 'COMPONENT',
}

export const APP_COOKIE_BASE = 'hey-amplify'
export const GUILD_COOKIE = `${APP_COOKIE_BASE}.guild`
