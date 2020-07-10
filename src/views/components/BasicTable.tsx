import React, { PropsWithChildren } from 'react'
import { HTMLTable, IHTMLTableProps } from '@blueprintjs/core'

export interface Column {
  key: string
  name: string
  render?: (name: string) => HTMLElement
}

export interface RenderCellProps {
  key: string
  value: any
}

export interface TableProps {
  columns: Column[]
  data: any[]
  renderCell?: (props: RenderCellProps) => HTMLElement
}

const BasicTable = (props: PropsWithChildren<TableProps> & IHTMLTableProps) => {
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
                {renderCell ? renderCell({ key, value: d[key] }) : d[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

export default BasicTable
