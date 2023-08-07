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
}

module.exports = new TripService()
