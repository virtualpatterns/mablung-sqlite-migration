import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/20211028004347-create-table-migration.js'
import { Migration as CreateIndexMigratioByName } from '../../library/migration/20211126213600-create-index-migration-by-name.js'

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

Test('migrationByName', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigratioByName(database)).install()

    let detail = null
    ;[ { detail } ] = await database.isMigrationInstalled('test-migration', true)

    test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByName (name=? AND isInstalled=? AND isUnInstalled=?)')

    ;[ { detail } ] = await database.uninstallMigration('test-migration', true)

    test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING INDEX migrationByName (name=? AND isInstalled=? AND isUnInstalled=?)')

  } finally {
    await database.close()
  }

})
