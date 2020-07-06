import React, { PropsWithChildren, CSSProperties } from 'react'

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
