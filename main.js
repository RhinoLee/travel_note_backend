const app = require('./app')
const { SERVER_PORT } = require('./config/server')

app.proxy = true
app.listen(SERVER_PORT, () => {
  console.log(`server is running at localhost port:${SERVER_PORT}`)
})
