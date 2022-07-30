import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  Modal,
  ModalSubmitInteraction,
} from 'discord.js'

export const button = new MessageButton()
  .setCustomId('thread-file-issue')
  .setLabel('File an issue')
  .setStyle('SECONDARY')

export const row = new MessageActionRow().addComponents(button)

function createModal() {
  const modal = new Modal()
    .setCustomId('file-an-issue')
    .setTitle('File an issue')

  // select menu is not supported
  // const row = new MessageActionRow().addComponents(
  // new MessageSelectMenu()
  //   .setCustomId('select-repo')
  //   .setPlaceholder('Nothing selected')
  //   .addOptions(
  //     {
  //       label: 'api',
  //       description: 'Amplify API repository',
  //       value: 'amplify-category-api',
  //     },
  //     {
  //       label: 'bot',
  //       description: 'Amplify Discord Bot repository',
  //       value: 'discord-bot',
  //     },
  //     {
  //       label: 'cli',
  //       description: 'Amplify CLI repository',
  //       value: 'amplify-cli',
  //     },
  //     {
  //       label: 'docs',
  //       description: 'Amplify Docs repository',
  //       value: 'amplify-docs',
  //     },
  //     {
  //       label: 'js',
  //       description: 'Amplify JS repository',
  //       value: 'amplify-js',
  //     },
  //     {
  //       label: 'ui',
  //       description: 'Amplify UI repository',
  //       value: 'amplify-ui',
  //     }
  //   )
  // )

  // Add inputs to the modal
  // modal.addComponents(row)
  return modal
}

export const modal = createModal()

export const buttonHandler = async (interaction: ButtonInteraction) => {
  await interaction.showModal(modal)
}

export const modalHandler = async (interaction: ModalSubmitInteraction) => {
  const favoriteColor =
    interaction.fields.getTextInputValue('favoriteColorInput')
  const hobbies = interaction.fields.getTextInputValue('hobbiesInput')
  console.log({ favoriteColor, hobbies })
}
