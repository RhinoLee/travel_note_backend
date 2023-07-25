module.exports = {
  up: `CREATE TABLE IF NOT EXISTS users(
    id INT PRIMARY KEY AUTO_INCREMENT,
    name varchar(50) NOT NULL,
    email varchar(256) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    avatar varchar(300) DEFAULT NULL
  );`,
  down: 'DROP TABLE users;'
}
