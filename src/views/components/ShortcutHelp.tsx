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
  helpTitle: {
    fontSize: '15px',
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
    padding: '1em 0.5em',
  },
  helpItem: {
    height: '3em',
    marginBottom: '0.5em',
    display: 'flex',
  },
  helpLabel: {
    width: '6em',
    padding: '0.25em',
  },
  helpCode: {
    backgroundColor: 'rgb(243,243,243)',
    color: 'rgb(33,33,33)',
    border: 'solid 1px #ccc',
    fontFamily: 'monospace',
    borderRadius: '4px',
    padding: '1px 3px',
  },
  helpInfo: {
    width: 'auto',
    padding: '0.25em',
  },
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ShortcutHelpProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ShortcutHelp = (props: PropsWithChildren<ShortcutHelpProps>) => {
  const shortcutContext = useContext(ShortcutContext)
  const [shortcutList, setShortcutList] = useState<
    { shortcuts: string[]; info: string }[]
  >([])
  useEffect(() => {
    const { config } = shortcutContext
    const shortcutItems = Object.keys(config)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => {
        const shortcut = config[key as ShortcutKey]
        const c = (bool: boolean | undefined, char: string) => {
          return bool ? `${char}-` : ''
        }
        return {
          shortcuts: shortcut.shortcuts.map(
            (s) =>
              `<${c(s.ctrlKey, 'c')}${c(s.altKey, 'a')}${c(s.metaKey, 'm')}${
                s.key
              }>`
          ),
          info: shortcut.info,
        }
      })
    setShortcutList(shortcutItems)
  }, [shortcutContext])
  return (
    <div style={styles.wrapper}>
      <div style={styles.helpTitle}>
        <h2>Help</h2>
      </div>
      <hr />
      <div style={styles.helpContent}>
        <ul style={styles.helpItemContainer}>
          {shortcutList.map((shortcut) => (
            <li key={shortcut.shortcuts.join('&')} style={styles.helpItem}>
              <div style={styles.helpLabel}>
                {shortcut.shortcuts.map((code) => (
                  <code key={code} style={styles.helpCode}>
                    {code}
                  </code>
                ))}
              </div>
              <div style={styles.helpInfo}>
                <p>{shortcut.info}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ShortcutHelp
