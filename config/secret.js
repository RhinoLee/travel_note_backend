const fs = require('fs')
const path = require('path')

const PRIVATE_KEY = fs.readFileSync(path.resolve(__dirname, './keys/private.key'))
const PUBLIC_KEY = fs.readFileSync(path.resolve(__dirname, './keys/public.key'))
const OPENAI_API_KEY = fs.readFileSync(path.resolve(__dirname, './keys/openai_api.key'))
const OPENAI_ORG_KEY = fs.readFileSync(path.resolve(__dirname, './keys/openai_org.key'))

module.exports = {
  PRIVATE_KEY,
  PUBLIC_KEY,
  OPENAI_API_KEY,
  OPENAI_ORG_KEY
}
