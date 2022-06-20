interface ISecret {
  name: string
  tags?: {
    [key: string]: string
  }
}

type SecretProps = ISecret & {
  value: string
}

export class Secret implements ISecret {
  private readonly value: string
  public readonly name: string
  public readonly tags: {
    [key: string]: string
  }

  constructor(props: SecretProps) {
    this.name = props.name
    this.value = props.value
    this.tags = props.tags || {}
  }
}
