import { page } from '$app/stores'
import { derived } from 'svelte/store'

export const createIntegrationHrefFromCode = (code: string) => {
  return `/admin/integrations/${code.toLowerCase()}`
}

type Breadcrumb = {
  name: string
  href: string
  overflow?: Breadcrumb[]
}

const crumbs: Breadcrumb[] = [
  {
    name: 'Admin',
    href: '/admin',
    overflow: [
      {
        name: 'Integrations',
        href: '/admin/integrations',
        overflow: [
          {
            name: 'GitHub',
            href: '/admin/integrations/github',
          },
        ],
      },
    ],
  },
]

export const breadcrumbs = derived(page, ($page) => {
  return generateBreadcrumbs($page.url.pathname)
})

export const map = generateBreadcrumbsMap(crumbs)

export function generateBreadcrumbsMap(breadcrumbs: Breadcrumb[]) {
  const map = new Map()
  const recursive = (breadcrumbs: Breadcrumb[]) => {
    for (const breadcrumb of breadcrumbs) {
      map.set(breadcrumb.href, breadcrumb)
      if (breadcrumb.overflow) {
        recursive(breadcrumb.overflow)
      }
    }
  }
  recursive(breadcrumbs)
  return map
}

/**
 * Generate breadcrumbs from a URL pathname
 * Construct overflow menu if overflow exists
 */
export function generateBreadcrumbs(pathname: string) {
  const crumbs: Breadcrumb[] = []
  const parts = pathname.split('/')
  let href = ''
  for (const part of parts) {
    if (part) {
      href += `/${part}`
      const breadcrumb = map.get(href)
      if (breadcrumb) {
        crumbs.push(breadcrumb)
      }
    }
  }
  const result = []
  for (let index = crumbs.length - 1; index >= 0; index--) {
    const current = crumbs[index]
    const prev = crumbs[index - 1]
    if (current?.overflow) {
      const currentOverflowItem = current.overflow.find(
        (c) => c.href === pathname
      )
      const partial = current.overflow.find((c) => pathname.startsWith(c.href))
      // determine whether we should display an href (if it's not the current page but a parent)
      let href: string | undefined
      if (partial?.href && partial.href !== pathname) {
        href = partial.href
      }
      // determine which overflow items to display
      let overflow
      if (href) {
        overflow = current.overflow.filter((c) => c.href === pathname)
      } else {
        overflow = current.overflow.filter((c) => c.href !== pathname)
      }

      // push item
      result.push({
        name: currentOverflowItem?.name || partial?.name,
        href,
        overflow,
      })
    }
    if (!prev) {
      let href
      if (current.href !== pathname) {
        href = current.href
      }
      result.push({ name: current.name, href })
    }
  }
  return result.reverse()
}

export function isParentOf(parent: string, child: string) {
  return child.startsWith(parent)
}
