import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/1638499024571-create-table-migration.js'
import { Migration as CreateIndexMigrationByNameWhen } from '../../library/migration/1638499205407-create-index-migration-by-name-when.js'
import { Migration as CreateIndexMigrationByNameIs } from '../../library/migration/1638499205408-create-index-migration-by-name-is.js'

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

Test.serial('migrationByNameIs', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameWhen(database)).install()
    await (new CreateIndexMigrationByNameIs(database)).install()

    await database.installMigration('test-migration')

    let [ { detail } ] = await database.isMigrationInstalled('test-migration', true)

    test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameIs (name=? AND isInstalled=? AND isUnInstalled=?)')

  } finally {
    await database.close()
  }

})

Test.serial('migrationByNameWhen', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameWhen(database)).install()
    await (new CreateIndexMigrationByNameIs(database)).install()

    await database.installMigration('test-migration')

    let [ , { detail: detail0 }, , { detail: detail1 } ] = await database.uninstallMigration('test-migration', true)

    test.log(detail0)
    test.is(detail0, 'SEARCH TABLE migration USING INDEX migrationByNameIs (name=? AND isInstalled=? AND isUnInstalled=?)')

    test.log(detail1)
    test.is(detail1, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameWhen (name=? AND whenInstalled=?)')

  } finally {
    await database.close()
  }

})
