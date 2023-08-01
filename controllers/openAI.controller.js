const { Configuration, OpenAIApi } = require('openai')
const { OPENAI_API_KEY, OPENAI_ORG_KEY } = require('../config/secret')

const configuration = new Configuration({
  organization: OPENAI_ORG_KEY,
  apiKey: OPENAI_API_KEY
})

console.log('configuration', configuration)

const openai = new OpenAIApi(configuration)
class openAIController {
  async completion(ctx) {
    const { query } = ctx.request.body
    console.log('query', query)
    try {
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
    } catch (error) {
      if (error.response) {
        console.log(error.response.status)
        console.log(error.response.data)
      } else {
        console.log(error.message)
      }

      ctx.status = 400
      ctx.body = {
        success: false,
        data: error
      }
    }
  }
}

module.exports = new openAIController()
