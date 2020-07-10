import React, {
  PropsWithChildren,
  useEffect,
  useContext,
  useState,
} from 'react'
import { StorageContext } from '@/contexts/StorageContext'
import BasicTable, { Column } from '../BasicTable'
import { createLogger } from '@/helpers/logger'
import { IVideo } from '@/models/video'
const logger = createLogger('VideoTable.tsx')

const VideoTable = (props: PropsWithChildren<unknown>) => {
  const { storageService } = useContext(StorageContext)
  const [data, setData] = useState<IVideo[]>([])
  const columns: Column<IVideo>[] = [
    { key: 'title', name: 'Title', width: '30em' },
    {
      key: 'url',
      name: 'Link',
      width: '20em',
      renderRow: (row) => (
        <a href={row.value as string} target="_blank">
          {row.value}
        </a>
      ),
    },
    {
      key: 'createdAt',
      name: 'Created At',
      renderRow: (row) => <p>{new Date(row.value as number).toISOString()}</p>,
    },
    {
      key: 'updatedAt',
      name: 'Updated At',
      renderRow: (row) => <p>{new Date(row.value as number).toISOString()}</p>,
    },
    {
      key: 'videoId',
      name: 'Video',
      renderRow: (row) => (
        <iframe
          width="180"
          height="90"
          src={`https://www.youtube.com/embed/${row.value}`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      ),
    },
  ]
  useEffect(() => {
    const asyncFn = async () => {
      if (!storageService) return
      const videos = await storageService.queryVideos({ limit: 100, offset: 0 })
      setData(videos)
    }
    asyncFn()
  }, [storageService])
  return <BasicTable columns={columns} data={data}></BasicTable>
}

export default VideoTable
