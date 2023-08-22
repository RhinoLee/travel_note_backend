const { pool } = require('../app/database')
const bcrypt = require('bcrypt')

class UserService {
  async create(userInfo) {
    let conn = null
    try {
      conn = await pool.getConnection()

      await conn.beginTransaction()

      const { name, password, email, provider, provider_id, avatar = null } = userInfo

      // user table
      const userStatement = `INSERT INTO users(name, email, avatar) VALUES(?, ?, ?)`
      const [user] = await conn.execute(userStatement, [name, email, avatar])

      // hash password
      let hashedPassword = null
      if (password) {
        const saltRounds = 10
        hashedPassword = await bcrypt.hash(password, saltRounds)
      }

      // user_authtication table
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
  async update({ id, name, avatar }) {
    if (!name) throw new Error('name is required')
    let conn = null
    try {
      conn = await pool.getConnection()
      const statement = `UPDATE users SET name = ?, avatar = ? WHERE id = ?`

      const result = await conn.execute(statement, [name, avatar, id])
      return result
    } catch (err) {
      console.log(err)
      throw err
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
  async findUserById(id) {
    const statement = 'SELECT * FROM `users` WHERE id = ?;'
    let conn = null
    try {
      conn = await pool.getConnection()

      const [values] = await conn.execute(statement, [id])

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
  async refreshTokenCompare(token, hashedToken) {
    if (!token || !hashedToken) return false
    const match = await bcrypt.compare(token, hashedToken)
    return match
  }
  async updateRefreshToken(userId, token) {
    let conn = null
    try {
      conn = await pool.getConnection()
      const statement = `
        UPDATE user_authentications 
        SET refresh_token = ?
        WHERE user_id = ?
      `

      // hash token
      let hashedToken = null
      if (token) {
        const saltRounds = 10
        hashedToken = await bcrypt.hash(token, saltRounds)
      }

      await conn.execute(statement, [hashedToken, userId])
    } catch (err) {
      console.log(err)
      throw err
    } finally {
      if (conn) conn.release()
    }
  }
}

module.exports = new UserService()
