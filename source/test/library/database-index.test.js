import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration } from './migration.js'

Test('migrationByNameIndex', async (test) => {

  let databasePath = 'process/data/migration-by-name-index.db'
  await FileSystem.ensureDir(Path.dirname(databasePath))

  await Migration.onInstall((database) => {
    return database.onOpen(async () => {
    
      let detail = null
      ;[ { detail } ] = await database.isMigrationInstalled(test.title, true)

      test.log(detail)
      test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameIndex (name=?)')

      ;[ { detail } ] = await database.uninstallMigration(test.title, true)

      test.log(detail)
      test.is(detail, 'SEARCH TABLE migration USING INDEX migrationByNameIndex (name=?)')

    })
  }, databasePath)

})
