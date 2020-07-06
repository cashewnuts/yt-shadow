import React, { createContext, PropsWithChildren, useState } from 'react'
import { createLogger } from '@/helpers/logger'
const logger = createLogger('ShortcutContext.tsx')

export enum ShortcutKey {
  PLAY = '01.play',
  PAUSE = '02.pause',
  TOGGLE = '03.toggle',
  REPEAT = '04.repeat',
  PREVIOUS = '05.previous',
  NEXT = '06.next',
  RANGEOPEN = '07.rangeopen',
  TOGGLE_ANSWER = '11.toggle-answer',
  HELP = '91.help',
}

export interface Shortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}

export interface ShortcutItem {
  shortcuts: Shortcut[]
  info: string
}

export type ShortcutConfig = {
  [key in ShortcutKey]: ShortcutItem
}

export const DefaultShortcutConfig: ShortcutConfig = {
  [ShortcutKey.PLAY]: {
    shortcuts: [{ key: 'k', ctrlKey: true }],
    info: 'Play',
  },
  [ShortcutKey.PAUSE]: {
    shortcuts: [{ key: 'j', ctrlKey: true }],
    info: 'Pause',
  },
  [ShortcutKey.TOGGLE]: {
    shortcuts: [{ key: 'r', ctrlKey: true }],
    info: 'Toggle Play/Pause',
  },
  [ShortcutKey.REPEAT]: {
    shortcuts: [{ key: 'r', ctrlKey: true }],
    info: 'Repeat',
  },
  [ShortcutKey.PREVIOUS]: {
    shortcuts: [{ key: 'h', ctrlKey: true }],
    info: 'Previous',
  },
  [ShortcutKey.NEXT]: {
    shortcuts: [{ key: 'l', ctrlKey: true }],
    info: 'Next',
  },
  [ShortcutKey.RANGEOPEN]: {
    shortcuts: [{ key: 'k', ctrlKey: true }],
    info: 'Open range',
  },
  [ShortcutKey.HELP]: {
    shortcuts: [{ key: 'k', ctrlKey: true }],
    info: 'Open help / Close help',
  },
  [ShortcutKey.TOGGLE_ANSWER]: {
    shortcuts: [{ key: 'o', ctrlKey: true }],
    info: 'Toggle show answer',
  },
  [ShortcutKey.HELP]: {
    shortcuts: [{ key: '/', ctrlKey: true }],
    info: 'Open help / Close help',
  },
}

export interface ShortcutContextParams {
  config: ShortcutConfig
}

export const ShortcutContext = createContext<ShortcutContextParams>({
  config: DefaultShortcutConfig,
})

export const ShortcutContextProvider = (props: PropsWithChildren<unknown>) => {
  const [shortcutConfig, setShortcutConfig] = useState<{
    config: ShortcutConfig
  }>({
    config: DefaultShortcutConfig,
  })
  return (
    <ShortcutContext.Provider value={shortcutConfig}>
      {props.children}
    </ShortcutContext.Provider>
  )
}

export const ShortcutContextConsumer = ShortcutContext.Consumer
