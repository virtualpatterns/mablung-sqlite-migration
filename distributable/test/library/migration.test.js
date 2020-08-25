import FileSystem from 'fs-extra';
import Path from 'path';
import Test from 'ava';

import { Database } from '../../index.js';
import { Migration } from './migration.js';

Test('Migration.getMigration(databasePath)', async test => {

  let databasePath = 'process/data/getMigration.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  let migration = await Migration.getMigration(databasePath);

  test.is(migration.length, 3);

  test.is(migration[0].name, '00000000000010-create-table-migration');
  test.is(await migration[0].isInstalled(), false);
  test.is(migration[1].name, '00000000000020-create-index-migration');
  test.is(await migration[1].isInstalled(), false);
  test.is(migration[2].name, '20200823213000-null');
  test.is(await migration[2].isInstalled(), false);

});

Test('Migration.installMigration(databasePath)', async test => {

  let databasePath = 'process/data/installMigration.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  await Migration.installMigration(databasePath);

  try {

    let migration = await Migration.getMigration(databasePath);

    test.is(migration.length, 3);

    test.is(await migration[0].isInstalled(), true);
    test.is(await migration[1].isInstalled(), true);
    test.is(await migration[2].isInstalled(), true);

  } finally {
    await Migration.uninstallMigration(databasePath);
  }

});

Test('Migration.uninstallMigration(databasePath)', async test => {

  let databasePath = 'process/data/uninstallMigration.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  await Migration.installMigration(databasePath);
  await Migration.uninstallMigration(databasePath);

  let migration = await Migration.getMigration(databasePath);

  test.is(migration.length, 3);

  test.is(await migration[0].isInstalled(), false);
  test.is(await migration[1].isInstalled(), false);
  test.is(await migration[2].isInstalled(), false);

});

Test('migrationIndex', async test => {

  let databasePath = 'process/data/migrationIndex.db';
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
//# sourceMappingURL=migration.test.js.map