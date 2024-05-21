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
  pgm.createType("linkPrecedence", ["primary", "secondary"]);
  pgm.createTable(
    "contact",
    {
      id: "id",
      createdAt: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      updatedAt: {
        type: "timestamp",
        notNull: true,
        default: pgm.func("current_timestamp"),
      },
      deletedAt: {
        type: "timestamp",
        default: null,
      },
      phoneNumber: {
        type: "string",
      },
      email: {
        type: "string",
      },
      linkedId: {
        type: "integer",
        references: '"contact"',
        onDelete: "SET NULL",
      },
      linkPrecedence: {
        type: '"linkPrecedence"',
      },
    },
    { ifExists: true }
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTable("contact", { ifExists: true });
};
