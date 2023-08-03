const path = require('path')
const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { GCP_BUCKET_NAME } = require('../config/secret')

const sharp = require('sharp')

const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/keys/gcp_storage.json')
})
const bucketName = Buffer.from(GCP_BUCKET_NAME, 'utf8').toString()
const bucket = storage.bucket(bucketName)

class tripController {
  async create(ctx) {
    const { title, startDate, endDate } = ctx.request.body
    const file = ctx.request.file
    const userId = 'xxxUserId'
    // 待回傳的圖片網址（上傳 cloud storage 成功）
    let imageUrl = ''

    // user 有上傳圖片
    if (file) {
      const filename = `${userId}/trips/${uuidv4()}.webp`
      const blob = bucket.file(filename)

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: 'image/webp'
        }
      })

      const getImageUrl = new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.log('Something is wrong! Unable to upload at the moment.' + err)
          reject(err)
        })

        blobStream.on('finish', async () => {
          console.log('All data has been written')
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`

          resolve(publicUrl)
        })
      })

      try {
        const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer()
        blobStream.end(buffer)
        imageUrl = await getImageUrl
      } catch (err) {
        ctx.body = {
          success: false,
          message: 'image upload failed'
        }
        return
      }
    }

    ctx.body = {
      success: true,
      data: { id: 'xxx', title, startDate, endDate, imageUrl }
    }
  }
}

module.exports = new tripController()
