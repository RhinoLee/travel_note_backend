const { pool } = require('../app/database')

class TripService {
  async create({ userId, title, description = null, startDate, endDate, imageUrl }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const tripsStatement = `
        INSERT INTO trips(user_id, name, description, start_date, end_date, image_url) VALUES(?, ?, ?, ?, ?, ?);
      `

      const [result] = await conn.execute(tripsStatement, [
        userId,
        title,
        description,
        startDate,
        endDate,
        imageUrl
      ])

      const newId = result.insertId || null
      const selectStatement = `
        SELECT id, name, description, start_date, end_date, image_url FROM trips WHERE id = ?;
      `
      const [rows] = await conn.execute(selectStatement, [newId])
      return rows[0]
    } catch (err) {
      console.log('database error', err)
      throw imageUrl
    } finally {
      if (conn) conn.release()
    }
  }
  async getList({ userId, limit, offset }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const statement = `
        SELECT id, name, image_url, start_date, end_date FROM trips 
        WHERE user_id = ? ORDER BY start_date DESC
        LIMIT ? OFFSET ?;
      `
      const [rows] = await conn.execute(statement, [userId, String(limit), String(offset)])

      const totalSizeStatement = `SELECT COUNT(*) FROM trips WHERE user_id = ?`
      const [[total]] = await conn.execute(totalSizeStatement, [userId])
      const totalSize = total['COUNT(*)']

      return { data: rows, pagination: { limit: Number(limit), offset, totalSize } }
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async getTrip({ userId, tripId }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const statement = `
        SELECT id, name, start_date, end_date FROM trips
        WHERE user_id = ? AND id = ?
      `
      const [rows] = await conn.execute(statement, [userId, tripId])

      return { data: rows[0] }
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async createTripDayWithDestination({
    tripId,
    trip_date,
    name,
    address,
    place_id,
    lat,
    lng,
    arrival_time,
    leave_time,
    visit_order
  }) {
    let conn = null
    try {
      conn = await pool.getConnection()
      await conn.beginTransaction()

      const tripDayStatement = `
        INSERT INTO trip_days(trip_id, trip_date) VALUES(?, ?);
      `
      const [tripDayResult] = await conn.execute(tripDayStatement, [tripId, trip_date])
      const trip_day_id = tripDayResult.insertId || null

      if (trip_day_id === null) throw Error('trip_day_id not found')

      const destinationStatement = `
        INSERT INTO destinations(name, address, place_id, lat, lng) VALUES(?, ?, ?, ?, ?);
      `
      const [destinationResult] = await conn.execute(destinationStatement, [
        name,
        address,
        place_id,
        lat,
        lng
      ])
      const destination_id = destinationResult.insertId || null
      if (destination_id === null) throw new Error('destination_id not found')

      const finalStatement = `
        INSERT INTO tripdays_destinations(trip_day_id, destination_id, arrival_time, leave_time, visit_order) VALUES(?, ?, ?, ?, ?);
      `

      const [finalResult] = await conn.execute(finalStatement, [
        trip_day_id,
        destination_id,
        arrival_time,
        leave_time,
        visit_order
      ])

      const finalId = finalResult.insertId || null
      if (finalId === null) throw Error('finalId not found')

      await conn.commit()

      return { id: finalId }
    } catch (err) {
      if (conn) await conn.rollback()
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
}

module.exports = new TripService()
