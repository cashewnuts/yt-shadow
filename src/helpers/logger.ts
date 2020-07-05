import pino from 'pino'

export const logger = pino({
  level: process.env.NODE_ENV !== 'development' ? 'info' : 'debug',
})

export const createLogger = (filename: string) => {
  return logger.child({ filename })
}
