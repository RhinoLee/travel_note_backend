module.exports = {
  up: `
    CREATE TABLE IF NOT EXISTS trip_days(
        id INT PRIMARY KEY AUTO_INCREMENT,
        trip_id INT NOT NULL,
        trip_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY(trip_id) REFERENCES trips(id) ON DELETE CASCADE ON UPDATE CASCADE
      );
    `,
  down: `DROP TABLE trip_days;`
}
