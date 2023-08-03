module.exports = {
  up: `
  CREATE TABLE IF NOT EXISTS tripdays_destinations(
    id INT PRIMARY KEY AUTO_INCREMENT,
    trip_day_id INT NOT NULL,
    destination_id INT NOT NULL,
    arrival_time TIME NOT NULL,
    leave_time TIME NOT NULL,
    visit_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(trip_day_id) REFERENCES trip_days(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(destination_id) REFERENCES destinations(id) ON DELETE CASCADE ON UPDATE CASCADE
  );
  `,
  down: `DROP TABLE tripdays_destinations;`
}
