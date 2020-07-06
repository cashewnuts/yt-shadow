import React, {
  PropsWithChildren,
  CSSProperties,
  useContext,
  useState,
  useEffect,
} from 'react'
import {
  ShortcutContext,
  ShortcutKey,
  ShortcutItem,
} from '@/contexts/ShortcutContext'

const styles: { [key: string]: CSSProperties } = {
  wrapper: {
    margin: '0.5em',
  },
  helpCloseButton: {
    position: 'absolute',
    top: '3px',
    right: '3px',
  },
  helpContent: {
    display: 'grid',
  },
  helpItemContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    listStyle: 'none',
  },
  helpItem: {
    height: '3em',
    background: '#00ffaa44',
    marginBottom: '0.5em',
  },
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ShortcutHelpProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ShortcutHelp = (props: PropsWithChildren<ShortcutHelpProps>) => {
  const shortcutContext = useContext(ShortcutContext)
  const [shortcutList, setShortcutList] = useState<ShortcutItem[]>([])
  useEffect(() => {
    const { config } = shortcutContext
    const shortcutItems = Object.keys(config)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        const shortcut = config[key as ShortcutKey]
        return shortcut
      })
    setShortcutList(shortcutItems)
  }, [shortcutContext])
  return (
    <div style={styles.wrapper}>
      <div>
        <h2>Help</h2>
      </div>
      <hr />
      <div style={styles.helpContent}>
        <ul style={styles.helpItemContainer}>
          <li style={styles.helpItem}>item 1</li>
          <li style={styles.helpItem}>item 2</li>
          <li style={styles.helpItem}>item 3</li>
          <li style={styles.helpItem}>item 4</li>
        </ul>
      </div>
    </div>
  )
}

export default ShortcutHelp
