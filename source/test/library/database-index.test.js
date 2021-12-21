import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/1638499024571-create-table-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/1638499205407-create-index-migration-by-name.js'
import { Migration as CreateIndexMigrationByNameIsInstalled } from '../../library/migration/1638499205408-create-index-migration-by-name-is-installed.js'

const FilePath = __filePath

const DatabasePath = FilePath.replace('/release/', '/data/').replace('.test.js', '.db')
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedDatabase = CreateLoggedDatabase(Database, LogPath)

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(DatabasePath)
})


Test.serial('migrationByName', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    let [ { detail } ] = await database.uninstallMigration('test-migration', true)

    test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING INDEX migrationByName (name=?)')

  } finally {
    await database.close()
  }

})

Test.serial('migrationByNameIsInstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    let [ { detail } ] = await database.isMigrationInstalled('test-migration', true)

    test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameIsInstalled (name=? AND isInstalled=?)')

  } finally {
    await database.close()
  }

})
