#!/usr/bin/env node
const { resolve } = require('path')
const { existsSync: exists } = require('fs')
const glob = require('tiny-glob')

let transformJsImportToCjsPlugin = {
  name: 'transform-js-import-to-cjs',
  setup(build) {
    build.onResolve({ filter: /^.[./].+([A-z0-9-_])?\.js$/ }, (args) => {
      if (args.importer)
        return { path: args.path.slice(0, -3) + '.cjs', external: true }
    })
  },
}

function parseArgs(args = []) {
  // argument regex (--arg, -a)
  const regex = /^-{1,2}(?<arg>[A-z]+)+$/i
  // parse argHash (--yay true => { yay: true })
  return args.reduce((argHash, arg, index) => {
    if (regex.test(arg)) {
      // verify next input is not also an argument without an input
      const name = arg.match(regex).groups.arg
      if (!args[index + 1] || regex.test(args[index + 1])) argHash[name] = true
      else argHash[name] = args[index + 1]
    } else if (/\.(js|mjs|cjs)$/i.test(arg)) {
      // test if argument is actually a file path
    }
    return argHash
  }, {})
}

// esbuild ./src/* --outdir=lib --format=cjs --platform=node --target=node14 --sourcemap=external --minify --out-extension:.js=.cjs
async function main(args) {
  const packageDir = process.env.PWD

  const indexFilePath = resolve(packageDir, 'index.js')
  const srcDirPath = resolve(packageDir, 'src')

  let entryPoints
  if (exists(indexFilePath)) entryPoints = [indexFilePath]
  if (exists(srcDirPath)) entryPoints = await glob(`${srcDirPath}/**/*.{js}`)
  if (!entryPoints) throw new Error('Unsupported entrypoint(s)')

  const outdir = resolve(packageDir, 'build')
  const external = Object.keys(
    require(resolve(packageDir, 'package.json'))?.dependencies || {}
  )

  require('esbuild')
    .build({
      bundle: true,
      entryPoints,
      external,
      minify: args.minify,
      sourcemap: 'external',
      outdir,
      platform: 'node',
      target: 'node14',
      outExtension: { '.js': '.cjs' },
      plugins: [transformJsImportToCjsPlugin],
    })
    .catch((error) => {
      process.exit(1)
    })
}

const args = parseArgs(process.argv.slice(2))
main(args)
