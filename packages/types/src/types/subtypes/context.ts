export type FlagOptions = {
  type: 'boolean' | 'string'
  description: string
  default?: unknown
}

export type CommandHandler = (args: string[]) => Promise<void>

export type CLIContext = {
  registerFlag (name: string, options: FlagOptions): void
  registerCommand (name: string, handler: CommandHandler): void
}

export type DevtoolsContext = {
  registerPanel (name: string, component: unknown): void
}