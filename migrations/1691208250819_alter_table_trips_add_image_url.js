module.exports = {
  up: `
    ALTER TABLE trips
    ADD COLUMN image_url VARCHAR(255) NULL;
  `,
  down: `
    ALTER TABLE trips
    DROP COLUMN image_url;
  `
}
