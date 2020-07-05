import React, { PropsWithChildren } from 'react'

export interface WriterContextMenuProps {
  onShowAnswer: () => void
}

const WriterContextMenu = (
  props: PropsWithChildren<WriterContextMenuProps>
) => {
  const { onShowAnswer } = props
  const liArr = [
    {
      event: onShowAnswer,
      label: 'Show Answer',
    },
  ]
  return (
    <div>
      <ul>
        {liArr.map((el) => (
          <li key={el.label} onClick={el.event}>
            {el.label}
          </li>
        ))}
        <li></li>
      </ul>
    </div>
  )
}

export default WriterContextMenu
