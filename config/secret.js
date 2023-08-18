const fs = require('fs')
const path = require('path')

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, './keys/private.key'))
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, './keys/public.key'))
const OPENAI_API_KEY = fs
  .readFileSync(path.resolve(__dirname, './keys/openai_api.key'), 'utf-8')
  .trim()
const OPENAI_ORG_KEY = fs
  .readFileSync(path.resolve(__dirname, './keys/openai_org.key'), 'utf-8')
  .trim()
const GCP_BUCKET_NAME = fs
  .readFileSync(path.resolve(__dirname, './keys/gcp_bucket_name.key'), 'utf-8')
  .trim()
const GOOGLE_CLIENT_ID = fs
  .readFileSync(path.resolve(__dirname, './keys/google_client_id.key'), 'utf-8')
  .trim()
const GOOGLE_CLIENT_SECRET = fs
  .readFileSync(path.resolve(__dirname, './keys/google_client_secret.key'), 'utf-8')
  .trim()

module.exports = {
  PRIVATE_KEY,
  PUBLIC_KEY,
  OPENAI_API_KEY,
  OPENAI_ORG_KEY,
  GCP_BUCKET_NAME,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET
}
