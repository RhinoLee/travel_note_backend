const path = require('path')
const sharp = require('sharp')
const { Storage } = require('@google-cloud/storage')
const { v4: uuidv4 } = require('uuid')
const { GCP_BUCKET_NAME } = require('../config/secret')
const { GCP_STORAGE_URL } = require('../config/constants/providerConstants')

// get bucket
const storage = new Storage({
  keyFilename: path.join(__dirname, '../config/keys/gcp_storage.json')
})
const bucketName = Buffer.from(GCP_BUCKET_NAME, 'utf8').toString()
const bucket = storage.bucket(bucketName)

async function uploadImageToGCP({ file, userId }) {
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

  const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer()
  blobStream.end(buffer)
  return await getImageUrl
}

async function deleteImageFromGCP(imageUrl) {
  const filename = imageUrl.split(`${GCP_STORAGE_URL}/${GCP_BUCKET_NAME}/`)[1]
  const file = bucket.file(filename)
  if (file) {
    await file.delete()
    console.log('Deleted file from Google Cloud Storage:', filename)
  }
}

module.exports = { uploadImageToGCP, deleteImageFromGCP }
