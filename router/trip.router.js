const KoaRouter = require('@koa/router')
const tripController = require('../controllers/trip.controller')
const { validateTrip, upload } = require('../middlewares/validateTrip.middleware')
const { verifyToken } = require('../middlewares/auth.middleware')
const tripRouter = new KoaRouter({ prefix: '/trip' })

tripRouter.post('/', verifyToken, upload.single('tripImage'), validateTrip, tripController.create)
tripRouter.post('/:trip_id', verifyToken, (ctx, next) =>
  tripController.createTripDayWithDestination(ctx, next)
)
tripRouter.delete('/:trip_id', verifyToken, tripController.deleteTrip)
tripRouter.get('/list', verifyToken, tripController.list)
tripRouter.get('/', verifyToken, tripController.trip)
tripRouter.get('/:trip_id/:trip_date', verifyToken, tripController.getTripDayWithDestination)

tripRouter.put('/:trip_id/:tripdays_destinations_id', verifyToken, (ctx, next) =>
  tripController.updateTripDayWithDestination(ctx, next)
)
tripRouter.delete(
  '/destination/:tripdays_destinations_id',
  verifyToken,
  tripController.deleteDestination
)

module.exports = tripRouter
