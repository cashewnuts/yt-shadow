import React, { PropsWithChildren } from 'react'
import { HTMLTable, IHTMLTableProps } from '@blueprintjs/core'

export interface RenderRowArgs<T> {
  key: keyof T
  value: T[keyof T]
  object: T
}

export interface Column<T> {
  key: keyof T
  name: string
  width?: number | string
  renderHeader?: (name: string) => HTMLElement | JSX.Element
  renderRow?: (args: RenderRowArgs<T>) => HTMLElement | JSX.Element
}

export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
}

const BasicTable = <T extends unknown>(
  props: PropsWithChildren<TableProps<T>> & IHTMLTableProps
) => {
  const { columns, data, ...rest } = props
  return (
    <HTMLTable {...rest}>
      <thead>
        <tr>
          {columns.map(({ key, name, width, renderHeader }) => (
            <th key={key + ''} style={{ width }}>
              {renderHeader ? renderHeader(name) : name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, index) => (
          <tr key={index}>
            {columns.map(({ key, renderRow }) => (
              <td key={key + ''}>
                {renderRow ? (
                  renderRow({ key, value: d[key], object: d })
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
