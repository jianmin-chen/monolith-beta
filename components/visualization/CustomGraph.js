import { useEffect, useRef, useState } from 'react'

// (row-major): channel, timestamp (n * 4): amplitude (mV)
export default function CustomGraph({
  data,
  width,
  height
}) {
  const canvasRef = useRef(null)

  const [ctx, setCtx] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = width
    canvas.height = height
    setCtx(canvas?.getContext('2d') ?? null)

    let currentColor = 0x000000 // hex

    const numChannels = data.length
    const numTimestamps = Math.max(...data.map(column => column.length))
    const maxValue = Math.max(...data.map(column => Math.max(...column)))
    const minValue = Math.min(...data.map(column => Math.min(...column)))

    if (ctx && canvasRef.current) {
      ctx.fillStyle = '#ffffff'
      ctx?.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.fillStyle = 'blue'
      ctx.strokeStyle = '#535971'

      ctx?.moveTo(0, height / maxValue)
      for (let i = 0; i < data.length; i++) {
        const length = data[i].length
        if (length > 100) data[i] = data[i].slice(length - 100, length)
        currentColor += 0x0000f
        ctx.strokeStyle = currentColor
        ctx?.beginPath()
        for (let j = 0; j < data[0].length; j++) {
          ctx?.lineTo(
            j * (width / numTimestamps),
            data[i][j] * (height / (maxValue - minValue))
          )
        }
        ctx?.stroke()
      }
    }
  }, [canvasRef, ctx, width, height, data])

  return <canvas width={width} height={height} ref={canvasRef}></canvas>
}
