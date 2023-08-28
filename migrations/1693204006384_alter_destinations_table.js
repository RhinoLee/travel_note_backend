module.exports = {
  up: `ALTER TABLE destinations ADD UNIQUE INDEX place_id_unique (place_id);`,
  down: `ALTER TABLE destinations DROP INDEX place_id_unique;`
}
