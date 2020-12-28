import FileSystem from 'fs-extra';
import Path from 'path';
import Test from 'ava';

import { Migration } from './migration.js';

Test('Database.run(statement, parameter) returns { numberOfChanges }', async test => {

  let databasePath = 'process/data/run.db';
  await FileSystem.ensureDir(Path.dirname(databasePath));

  await Migration.onInstall(database => {
    return database.onOpen(async () => {
      test.is((await database.installMigration(test.title)).numberOfChanges, 1);
    });
  }, databasePath);

});
//# sourceMappingURL=database.test.js.map