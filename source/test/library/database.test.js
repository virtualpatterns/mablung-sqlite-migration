import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Database } from './database.js'
import { Migration } from './migration.js'

Test('Database.run(statement, parameter) returns { numberOfChanges }', async (test) => {

  let databasePath = 'process/data/run.db'
  await FileSystem.ensureDir(Path.dirname(databasePath))

  await Migration.installMigration(databasePath)

  try {
    
    let database = new Database(databasePath)

    await database.open()

    try {
      
      let { numberOfChanges } = await database.installMigration(test.title)

      test.is(numberOfChanges, 1)

    } finally {
      await database.close()
    }

  } finally {
    await Migration.uninstallMigration(databasePath)
  }

})

Test('migrationIndex', async (test) => {

  let databasePath = 'process/data/migrationIndex.db'
  await FileSystem.ensureDir(Path.dirname(databasePath))

  await Migration.installMigration(databasePath)

  try {
    
    let database = new Database(databasePath)

    await database.open()

    try {
    
      let detail = null
      ;[ { detail } ] = await database.isMigrationInstalled(test.title, true)

      test.log(detail)
      test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationIndex (name=?)')

      ;[ { detail } ] = await database.uninstallMigration(test.title, true)

      test.log(detail)
      test.is(detail, 'SEARCH TABLE migration USING INDEX migrationIndex (name=?)')

    } finally {
      await database.close()
    }

  } finally {
    // await Migration.uninstallMigration(databasePath)
  }

})
