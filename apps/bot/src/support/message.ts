import { MessageEmbed } from 'discord.js'

export type CreateMessageInput = {
  content?: string
  embed?: MessageEmbed
}

export class Message {
  public content: string | undefined
  public embed: MessageEmbed

  constructor(content?: string, embed?: MessageEmbed) {
    this.content = content
    if (embed) {
      this.embed = embed
    } else {
      this.embed = new MessageEmbed()
      this.embed.setColor('#ff9900')
    }
  }

  public set(content: string) {
    this.content = content
    this.embed.setDescription(content)
  }

  public toMessage() {
    return {
      content: this.content,
      embeds: [this.embed],
    }
  }
}

export function createMessage(input: CreateMessageInput) {
  return new Message(input?.content, input?.embed).toMessage()
}
