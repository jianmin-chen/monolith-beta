import { useEffect, useRef, useState } from 'react'
import { get } from '@/lib/fetch'
import styles from './Demo.module.scss'
import { Editor } from '@monaco-editor/react'
import CustomGraph from '../visualization/CustomGraph'
import {
  FiUpload,
  FiPause,
  FiPlay,
  FiChevronRight,
  FiChevronDown
} from 'react-icons/fi'

export default function Demo({
  data,
  pause,
  setPause,
  read
}) {
  const graphSize = useRef(null)
  const [graphWidth, setGraphWidth] = useState(500)
  const [graphHeight, setGraphHeight] = useState(500)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const graph = graphSize.current
    if (graph !== null) {
      setGraphWidth(graph.clientWidth)
      setGraphHeight(graph.clientHeight)
    }
  }, [])

  return (
    <div className='dashboard'>
    <div className={styles.dashboard}>
      <div className={styles.datasets}>
        <div className={styles.dropdown}>
          <button
            className={styles.dropdownHeader}
            onClick={() => setOpen(old => !old)}>
            {open ? <FiChevronDown /> : <FiChevronRight />}
            <span>Datasets</span>
          </button>
          <div>
            <button style={{ display: open ? "block" : "none"}}>UVM study group</button>
            <button className={styles.selected} style={{ display: open ? "block" : "none"}}>UCLA study group</button>
          </div>
        </div>
        <div>
          <button style={{ paddingBottom: '1rem' }}>Log out</button>
        </div>
      </div>
      <div className={styles.viz}>
        <div className={styles.options}>
          <button>
            <FiUpload />
            <span>Upload</span>
          </button>
          <button
            onClick={() => {
              if (pause === null) setPause(setInterval(read, 100))
              else {
                clearInterval(pause)
                setPause(null)
              }
            }}>
            {pause !== null ? <FiPause /> : <FiPlay />}
            <span>Pause</span>
          </button>
        </div>
        <div className={styles.graph} ref={graphSize}>
          <CustomGraph data={data} width={graphWidth} height={graphHeight} />
        </div>
      </div>
    </div>
    </div>
  )
}
