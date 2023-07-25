module.exports = {
  up: `
    CREATE TABLE IF NOT EXISTS user_authentications(
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      provider VARCHAR(20) DEFAULT NULL,
      provider_id VARCHAR(300) DEFAULT NULL,
      password VARCHAR(300) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `,
  down: 'DROP TABLE user_authentications;'
}
