import * as signale from 'signale'

declare global {
  const logger: signale.Signale<signale.DefaultMethods>
  const interactiveLogger: signale.Signale<signale.DefaultMethods>
}
