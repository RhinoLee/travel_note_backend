const path = require('path')
const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { GCP_BUCKET_NAME } = require('../config/secret')
const { GCP_STORAGE_URL } = require('../config/constants/providerConstants')
const tripService = require('../services/trip.service')

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
    const { userId } = ctx
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
          const publicUrl = `${GCP_STORAGE_URL}/${bucket.name}/${blob.name}`

          resolve(publicUrl)
        })
      })

      try {
        const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer()
        blobStream.end(buffer)
        imageUrl = await getImageUrl

        const trip = await tripService.create({ userId, title, startDate, endDate, imageUrl })

        ctx.body = {
          success: true,
          data: trip
        }
      } catch (err) {
        console.log('image upload err', err)
        // 建立資料失敗，刪除上傳的圖片
        if (err === imageUrl) {
          const filename = err.split(`${GCP_STORAGE_URL}/${GCP_BUCKET_NAME}/`)[1]
          const file = bucket.file(filename)
          if (file) file.delete()
          console.log('Deleted file from Google Cloud Storage:', filename)
        }
        ctx.body = {
          success: false,
          message: 'create trip failed'
        }
        return
      }
    }
  }
  async list(ctx) {
    const { limit, page } = ctx.query
    const { userId } = ctx
    try {
      const offset = (page - 1) * limit
      const { data, pagination } = await tripService.getList({ userId, limit, offset })
      const totalPages = Math.ceil(pagination.totalSize / pagination.limit)
      pagination.totalPages = totalPages
      pagination.page = Number(page)
      ctx.body = {
        success: true,
        data,
        pagination
      }
    } catch (err) {
      ctx.body = {
        success: false,
        message: 'get trips failed'
      }
    }
  }
}

module.exports = new tripController()
