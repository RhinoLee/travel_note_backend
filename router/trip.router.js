const KoaRouter = require('@koa/router')
const tripController = require('../controllers/trip.controller')
const { validateTrip, upload } = require('../middlewares/validateTrip.middleware')
const { verifyToken } = require('../middlewares/auth.middleware')
const tripRouter = new KoaRouter({ prefix: '/trip' })

tripRouter.post('/', verifyToken, upload.single('tripImage'), validateTrip, tripController.create)
tripRouter.get('/list', verifyToken, tripController.list)

module.exports = tripRouter
