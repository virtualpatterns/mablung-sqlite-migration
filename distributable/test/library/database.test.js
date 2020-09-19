import FileSystem from 'fs-extra';
import Path from 'path';
import Test from 'ava';

import { Database } from './database.js';
import { Migration } from './migration.js';

Test('Database.run(statement, parameter)', async test => {

  let databasePath = 'process/data/run.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  await Migration.installMigration(databasePath);

  try {

    let database = new Database(databasePath);

    await database.open();

    try {

      let { numberOfChanges } = await database.installMigration(test.title);

      test.is(numberOfChanges, 1);

    } finally {
      await database.close();
    }

  } finally {
    await Migration.uninstallMigration(databasePath);
  }

});

Test('Database.explainIndexMigration()', async test => {

  let databasePath = 'process/data/explainIndexMigration.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  await Migration.installMigration(databasePath);

  try {

    let database = new Database(databasePath);

    await database.open();

    try {

      let explanation = await database.explainIndexMigration('migrationIndex');

      test.log(explanation[0].detail);
      test.is(explanation[0].detail, 'SEARCH TABLE migration USING COVERING INDEX migrationIndex (name=?)');

    } finally {
      await database.close();
    }

  } finally {
    await Migration.uninstallMigration(databasePath);
  }

});
//# sourceMappingURL=database.test.js.map