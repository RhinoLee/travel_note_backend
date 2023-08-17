module.exports = {
  up: `
      ALTER TABLE user_authentications
      ADD COLUMN refresh_token VARCHAR(60) NULL UNIQUE;
    `,
  down: `
      ALTER TABLE user_authentications
      DROP COLUMN refresh_token;
    `
}
