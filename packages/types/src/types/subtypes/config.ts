export type RemoteConfig = {
  url: string
  secret: string
}

export type MetaframeworkConfig = {
  remote?: boolean | 'production' | 'preview'
  provider?: string
}

export type ConfigProperty = {
  type: 'string' | 'boolean' | 'number' | 'object'
  default?: unknown
  description?: string
}

export type ConfigSchema = {
  properties: Record<string, ConfigProperty>
  required?: string[]
}