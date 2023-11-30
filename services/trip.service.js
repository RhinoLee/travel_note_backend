const { pool } = require('../app/database')

class TripService {
  async create({ userId, title, description = null, start_date, end_date, imageUrl }) {
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
        start_date,
        end_date,
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
  async getTrip({ userId, trip_id }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const statement = `
        SELECT id, name, start_date, end_date, image_url FROM trips
        WHERE user_id = ? AND id = ?
      `
      const [rows] = await conn.execute(statement, [userId, trip_id])

      return { data: rows[0] }
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async deleteTrip(trip_id, userId) {
    let conn = null

    try {
      conn = await pool.getConnection()

      // 先找出 trip 關聯的 destinations 刪除

      // 刪除 trip
      const statement = `
        DELETE FROM trips WHERE id = ? AND user_id = ?
      `

      const result = await conn.execute(statement, [trip_id, userId])
      return result
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async createTripDay({ trip_id, trip_date }) {
    let conn = null
    try {
      conn = await pool.getConnection()
      const tripDayStatement = `
          INSERT INTO trip_days(trip_id, trip_date) VALUES(?, ?);
        `
      const [tripDayResult] = await conn.execute(tripDayStatement, [trip_id, trip_date])
      const trip_day_id = tripDayResult.insertId ?? null

      return { trip_day_id }
    } catch (err) {
      console.log('createTripDate err: ', err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async createTripDayWithDestination({
    trip_day_id,
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
      let destination_id = null
      // 先查看資料庫是否已經有存在的 place_id，沒有則新增
      const statement = `
        SELECT id FROM destinations WHERE place_id = ?;
      `
      const [rows] = await conn.execute(statement, [place_id])
      if (rows.length > 0) {
        destination_id = rows[0].id
      } else {
        // 資料庫找不到這筆 place_id -> 新增目的地資訊
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
        destination_id = destinationResult.insertId ?? null
      }

      if (destination_id === null) throw new Error('destination_id not found')
      // 新增 tripday 跟 destination 的關聯
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
  async getTripDay({ trip_id, trip_date }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const statement = `
        SELECT id FROM trip_days
        WHERE trip_id = ? AND trip_date = ?
      `

      const [rows] = await conn.execute(statement, [trip_id, trip_date])
      return rows
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async getTripDayWithDestination({ userId, trip_id, trip_date }) {
    let conn = null
    try {
      conn = await pool.getConnection()

      const statement = `
        SELECT
          td.id, td.arrival_time, td.leave_time, td.visit_order,
          d.name as name, d.place_id, d.lat, d.lng, d.id as destination_id,
          t.trip_id, t.trip_date, t.id as trip_day_id
        FROM tripdays_destinations AS td
        LEFT JOIN destinations AS d
        ON td.destination_id = d.id
        LEFT JOIN trip_days AS t
        ON td.trip_day_id = t.id
        LEFT JOIN trips as ts
        ON t.trip_id = ts.id
        WHERE ts.user_id = ? AND t.trip_id = ? AND t.trip_date = ?
        ORDER BY td.arrival_time ASC;
      `

      const [rows] = await conn.execute(statement, [userId, trip_id, trip_date])
      return rows
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async deleteDestination(tripdays_destinations_id) {
    let conn = null

    try {
      conn = await pool.getConnection()

      const statement = `
        DELETE FROM tripdays_destinations WHERE id = ?
      `

      const result = await conn.execute(statement, [tripdays_destinations_id])
      console.log('result', result)
      return result
    } catch (err) {
      console.log('deleteDestination service err: ', err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async deleteDestinationWithTripDayId(trip_day_id) {
    let conn = null

    try {
      conn = await pool.getConnection()

      const statement = `
        DELETE FROM tripdays_destinations WHERE trip_day_id = ?
      `

      const result = await conn.execute(statement, [trip_day_id])
      return result
    } catch (err) {
      console.log('deleteDestination service err: ', err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  // 從 tripdays_destinations table 中取得 tripday id & destaination id
  async getTripDayAndDestinationId(id) {
    let conn = null

    try {
      conn = await pool.getConnection()
      const statement = `
        SELECT trip_day_id, destination_id FROM tripdays_destinations WHERE id = ?
      `

      const [rows] = await conn.execute(statement, [id])
      return { data: rows[0] }
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
  async updateTripDayWithDestination({
    userId,
    trip_id,
    tripdays_destinations_id,
    arrival_time,
    leave_time,
    trip_date,
    trip_day_id
  }) {
    let conn = null

    try {
      conn = await pool.getConnection()
      await conn.beginTransaction()

      const tripDayDestinationStatement = `
        UPDATE tripdays_destinations
        SET arrival_time = ?, leave_time = ?, trip_day_id = ?
        WHERE id = ?;
      `

      conn.execute(tripDayDestinationStatement, [
        arrival_time,
        leave_time,
        trip_day_id,
        tripdays_destinations_id
      ])

      await conn.commit()

      return await this.getTripDayWithDestination({ userId, trip_id, trip_date })
    } catch (err) {
      if (conn) await conn.rollback()
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
}

module.exports = new TripService()
