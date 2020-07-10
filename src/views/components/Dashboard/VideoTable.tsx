import React, {
  PropsWithChildren,
  useEffect,
  useContext,
  useState,
} from 'react'
import { StorageContext } from '@/contexts/StorageContext'
import BasicTable, { RenderCellProps } from '../BasicTable'

const VideoTable = (props: PropsWithChildren<unknown>) => {
  const { storageService } = useContext(StorageContext)
  const [data, setData] = useState<{ test: string; world: string }[]>([])
  const columns = [
    { key: 'test', name: 'hello' },
    { key: 'world', name: 'world' },
  ]
  useEffect(() => {
    const asyncFn = async () => {
      if (!storageService) return
      setData([{ test: 'testName', world: 'worldName' }])
    }
    asyncFn()
  }, [storageService])
  const handleRenderCell = (
    props: RenderCellProps<{ test: string; world: string }>
  ) => {
    console.log(props)
    if (props.key === 'world') {
      return <p>{`world name is ${props.value as string}`}</p>
    }
    return <p>{JSON.stringify(props.object)}</p>
  }
  return (
    <BasicTable
      columns={columns}
      data={data}
      renderCell={handleRenderCell}
    ></BasicTable>
  )
}

export default VideoTable
