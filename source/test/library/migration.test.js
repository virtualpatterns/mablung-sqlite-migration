import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration } from '../../index.js'

Test.before(async (test) => {

  let databasePath = 'process/data/data.db'
  await FileSystem.ensureDir(Path.dirname(databasePath))

  test.context.databasePath = databasePath

})

Test.serial('Migration.getMigration(databasePath)', async (test) => {

  let migration = await Migration.getMigration(test.context.databasePath)

  test.is(migration.length, 2)
  
  test.is(migration[0].name, '00000000000010-create-table-migration')
  test.is(await migration[0].isInstalled(), false)
  test.is(migration[1].name, '00000000000020-create-index-migration')
  test.is(await migration[1].isInstalled(), false)

})

Test.serial('Migration.installMigration(databasePath)', async (test) => {

  await Migration.installMigration(test.context.databasePath)

  let migration = await Migration.getMigration(test.context.databasePath)

  test.is(migration.length, 2)

  test.is(await migration[0].isInstalled(), true)
  test.is(await migration[1].isInstalled(), true)

})

Test.serial('Migration.uninstallMigration(databasePath)', async (test) => {

  await Migration.uninstallMigration(test.context.databasePath)

  let migration = await Migration.getMigration(test.context.databasePath)

  test.is(migration.length, 2)

  test.is(await migration[0].isInstalled(), false)
  test.is(await migration[1].isInstalled(), false)

})
