import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/20211028004347-create-table-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/20211028004725-create-index-migration-by-name.js'

const FilePath = __filePath
const Require = __require

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

Test('migrationByNameIndex', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new CreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    let detail = null
    ;[ { detail } ] = await database.isMigrationInstalled('test-migration', true)

    // test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameIndex (name=?)')

    ;[ { detail } ] = await database.uninstallMigration('test-migration', true)

    // test.log(detail)
    test.is(detail, 'SEARCH TABLE migration USING INDEX migrationByNameIndex (name=?)')

  } finally {
    await database.close()
  }

})
