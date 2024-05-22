/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createIndex("contact", "email");
  pgm.createIndex("contact", "phoneNumber");
  pgm.db.query(
    `CREATE UNIQUE INDEX "contact_email_phoneNumber_unique_index" ON "contact" (coalesce("email", '00000000-0000-0000-0000-000000000000'), coalesce("phoneNumber", '00000000-0000-0000-0000-000000000000'))`
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropIndex("contact", "email");
  pgm.dropIndex("contact", "phoneNumber");
  pgm.dropIndex("contact", ["email", "phoneNumber"], { unique: true });
};
