const KoaRouter = require('@koa/router')
const tripController = require('../controllers/trip.controller')
const { validateTrip, upload } = require('../middlewares/validateTrip.middleware')
const tripRouter = new KoaRouter({ prefix: '/trip' })

tripRouter.post('/', upload.single('trip_image'), validateTrip, tripController.create)

module.exports = tripRouter
