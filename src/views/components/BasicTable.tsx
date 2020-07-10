import React, { PropsWithChildren } from 'react'
import { HTMLTable, IHTMLTableProps } from '@blueprintjs/core'

export interface Column {
  key: string
  name: string
  render?: (name: string) => HTMLElement
}

export interface RenderCellProps<T> {
  key: string
  value: unknown
  object: T
}

export interface TableProps<T> {
  columns: Column[]
  data: T[]
  renderCell?: (props: RenderCellProps<T>) => JSX.Element
}

interface StringKeyObject {
  [key: string]: unknown
}

const BasicTable = <T extends StringKeyObject>(
  props: PropsWithChildren<TableProps<T>> & IHTMLTableProps
) => {
  const { columns, data, renderCell, ...rest } = props
  return (
    <HTMLTable {...rest}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>
              {column.render ? column.render(column.name) : column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, index) => (
          <tr key={index}>
            {columns.map(({ key }) => (
              <td key={key}>
                {renderCell ? (
                  renderCell({ key, value: d[key], object: d })
                ) : (
                  <p>{d[key] + ''}</p>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

export default BasicTable
