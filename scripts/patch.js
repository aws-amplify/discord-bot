const { writeFile } = require('fs').promises
const { resolve } = require('path')

const PACKAGED_NODE_MODULES = 'packaged-node-modules'

async function main() {
  const pluginsFilePath = resolve(process.env.HOME, '.amplify/plugins.json')
  let pluginsFileContent
  try {
    pluginsFileContent = require(pluginsFilePath) // require json modules
    // pluginsFileContent = JSON.parse(await readFile(pluginsFilePath, 'utf8'))
  } catch (error) {
    throw new Error('Unable to read plugins file', error)
  }

  if (
    pluginsFileContent?.pluginDirectories?.length &&
    !pluginsFileContent.pluginDirectories.some(
      (pluginDirectory) => pluginDirectory === PACKAGED_NODE_MODULES
    )
  ) {
    pluginsFileContent.pluginDirectories.push(PACKAGED_NODE_MODULES)
  }

  try {
    await writeFile(
      pluginsFilePath,
      JSON.stringify(pluginsFileContent, null, 2),
      'utf8'
    )
  } catch (error) {
    throw new Error('Unable to write to plugins.json', error)
  }
}

main()
