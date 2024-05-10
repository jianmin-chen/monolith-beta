import * as csv from 'fast-csv'
import fs from 'fs'
import path from 'path'

export default async function handler(
  req,
  res
) {
  // Send random test data from test file
  const getData = async () =>
    new Promise((resolve, reject) => {
      let data = []
      fs.createReadStream(path.join(process.cwd(), './lib/test.csv'))
        .pipe(csv.parse({ headers: false }))
        .on('error', error => reject(error))
        .on('data', row => {
          data.push(row)
        })
        .on('end', () => {
          return resolve(data)
        })
    })

  if (!global.testData) global.testData = await getData()

  const randomRow =
    global.testData[Math.floor(Math.random() * global.testData.length)]
  return res.status(200).json({
    success: true,
    data: {
      key: Number(randomRow[0]),
      accel: randomRow.slice(9, 12).map(i => Number(i)),
      time: randomRow[12],
      timestamp: Number(randomRow[13]),
      channels: randomRow.slice(1, 9).map(i => Number(i)),
      channel1: Number(randomRow[1]),
      channel2: Number(randomRow[2]),
      channel3: Number(randomRow[3]),
      channel4: Number(randomRow[4]),
      channel5: Number(randomRow[5]),
      channel6: Number(randomRow[6]),
      channel7: Number(randomRow[7]),
      channel8: Number(randomRow[8])
    }
  })
}
