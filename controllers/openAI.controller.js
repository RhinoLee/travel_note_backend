const { Configuration, OpenAIApi } = require('openai')
const { OPENAI_API_KEY, OPENAI_ORG_KEY } = require('../config/secret')
const orgBuf2Str = Buffer.from(OPENAI_ORG_KEY, 'utf8').toString()
const apiBuf2Str = Buffer.from(OPENAI_API_KEY, 'utf8').toString()

const configuration = new Configuration({
  organization: orgBuf2Str,
  apiKey: apiBuf2Str
})

const openai = new OpenAIApi(configuration)
class openAIController {
  async completion(ctx) {
    const { query } = ctx.request.body
    console.log('query', query)
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful taiwan travel assistant.' },
        {
          role: 'user',
          content: `${query}，請以 JSON 格式回答，如下，key-value 要隨著天數改變，地點數量不限：
            {
              "day1": [
                "地點名稱 地址",
                "地點名稱 地址",
                "地點名稱 地址",
                "地點名稱 地址"
              ],
              "day2": [
                "地點名稱 地址",
                "地點名稱 地址",
                "地點名稱 地址"
              ]
            }`
        }
      ]
    })

    const result = JSON.parse(completion.data.choices[0].message.content)

    ctx.body = {
      success: true,
      data: result
    }
    console.log('completion', completion)
  }
}

module.exports = new openAIController()
