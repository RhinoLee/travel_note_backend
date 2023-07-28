const { pool } = require('../app/database')
const bcrypt = require('bcrypt')

class UserService {
  async create(userInfo) {
    let conn = null
    try {
      conn = await pool.getConnection()

      await conn.beginTransaction()

      const { name, password, email, provider, provider_id } = userInfo

      const userStatement = `INSERT INTO users(name, email) VALUES(?, ?)`
      const [user] = await conn.execute(userStatement, [name, email])

      // hash password
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const authenticationStatement = `INSERT INTO user_authentications(user_id, provider, provider_id, password) VALUES(?, ?, ?, ?)`
      await conn.execute(authenticationStatement, [
        user.insertId,
        provider,
        provider_id,
        hashedPassword
      ])

      await conn.commit()

      return { success: true, message: 'User created successfully.' }
    } catch (error) {
      if (conn) await conn.rollback()
      throw error
    } finally {
      if (conn) conn.release()
    }
  }
  async findUserByEmail(email) {
    const statement = 'SELECT * FROM `users` WHERE email = ?;'
    let conn = null
    try {
      conn = await pool.getConnection()

      const [values] = await conn.execute(statement, [email])

      return values
    } catch (error) {
      console.log(error)
      throw error
    } finally {
      if (conn) conn.release()
    }
  }
  async passwordCompare(password, hashedPassword) {
    if (!password || !hashedPassword) return false
    const match = await bcrypt.compare(password, hashedPassword)
    return match
  }
}

module.exports = new UserService()
