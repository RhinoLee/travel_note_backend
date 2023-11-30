const { Configuration, OpenAIApi } = require('openai')
const { OPENAI_API_KEY, OPENAI_ORG_KEY } = require('../config/secret')
const tripController = require('../controllers/trip.controller')
const findPlace = require('../utils/findPlace')

const configuration = new Configuration({
  organization: OPENAI_ORG_KEY,
  apiKey: OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)
class openAIController {
  async completion(ctx) {
    const { query, trip_id, trip_date } = ctx.request.body
    const { userId } = ctx
    try {
      // gpt prompt
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-1106',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful travel assistant and always write the output of your response in JSON object.'
          },
          {
            role: 'user',
            content: `
              請為我提供一天的${query}行程，並以JSON格式回應。需遵循以下規定：
              - 最多5個目的地。
              - 目的地的到達時間需要考慮上一個目的地的離開時間與路程距離
              - 開始時間為台灣時間 9:00:00，結束時間為 22:00:00。
              - 將台灣時間轉為 UTC+0（減少8小時）。
              - 使用 "hh:mm:ss" 格式，並只給整點時間。
              - 回傳結果只需要 JSON 物件格式，不要有其他文字
              
              JSON 範例如下：
              {
                "data":[
                  {
                    "address":"完整地址，需加上郵遞區號",
                    "name":"Google Maps 的地點名稱",
                    "arrival_time":"03:00:00",
                    "leave_time":"04:00:00"
                  }
                ]
              }
            `
          }
        ]
      })

      console.log('gpt response content: ', completion.data.choices[0].message.content)
      const gptResult = JSON.parse(completion.data.choices[0].message.content).data
      if (gptResult.length > 6) gptResult.length = 6

      // 用 gpt response 跟 google map api 要正確的資料 & add place_id
      const promises = gptResult.map(async (item) => {
        return findPlace(item)
      })

      await Promise.all(promises)

      // 把 places 整理成 createTripDayWithDestination(controller) 需要的格式
      const places = gptResult
        .filter((item) => !item.isDelete)
        .map((item) => ({
          ...item,
          visit_order: 0,
          trip_id,
          trip_date
        }))

      ctx.request.body = places

      // 新增 gpt 的 destinations 之前，先刪除這個 date 跟 destination 的關聯（tripdays_destination table）
      await tripController.deleteDestinationWithTripDayId(userId, trip_id, trip_date)

      // 新增 gpt 的 destinations
      await tripController.createTripDayWithDestination(ctx)

      ctx.body = {
        success: true,
        data: {}
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
