import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Sinon from 'sinon'
import SQLite from 'sqlite3'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/1638499024571-create-table-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/1638499205407-create-index-migration-by-name.js'
import { Migration as CreateIndexMigrationByNameInstalled } from '../../library/migration/1638499205408-create-index-migration-by-name-installed.js'

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

Test.serial('Database(\'...\')', (test) => {
  test.notThrows(() => { new LoggedDatabase(DatabasePath) })
})

Test.serial('Database(\'...\', ...)', (test) => {
  test.notThrows(() => { new LoggedDatabase(DatabasePath, SQLite.OPEN_READONLY) })
})

Test.serial('open()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await test.notThrowsAsync(database.open())
  return database.close()

})

Test.serial('open() throws SQLITE_CANTOPEN', (test) => {
  return test.throwsAsync((new LoggedDatabase(DatabasePath, SQLite.OPEN_READONLY)).open(), { 'code': 'SQLITE_CANTOPEN' })
})

Test.serial('close()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()
  return test.notThrowsAsync(database.close())

})

Test.serial('close() throws Error', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await test.notThrowsAsync(database.open())

  Sinon
    .stub(database.database, 'close')
    .callsArgWith(0, new Error())
  
  return test.throwsAsync(database.close(), { 'instanceOf': Error })

})

Test.serial('count', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  test.is(await database.open(), 1)
  
  try {
    test.is(await database.open(), 2)
    test.is(await database.close(), 1)
  } finally {
    test.is(await database.close(), 0)
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when not installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns true when installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when uninstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns true when reinstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await database.installMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when reuninstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await test.notThrowsAsync(database.installMigration('test-migration'))
    
  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\') when reinstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.installMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\') throws SQLITE_ERROR', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {
    await test.throwsAsync(database.installMigration('test-migration'), { 'code': 'SQLITE_ERROR' })
  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.uninstallMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\') when reuninstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await test.notThrowsAsync(database.uninstallMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('beginTransaction()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await test.notThrowsAsync(database.beginTransaction())
    await database.installMigration('test-migration')
    await database.commitTransaction()

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('commitTransaction()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.beginTransaction()
    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.commitTransaction())

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('rollbackTransaction()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.beginTransaction()
    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.rollbackTransaction())

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('execute(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await test.notThrowsAsync(async () => {

      let query = ' pragma foreign_keys = true; \
                    pragma automatic_index = false;'

      await database.execute(query)

    })

  } finally {
    await database.close()
  }

})

Test.serial('execute(\'...\') throws SQLITE_ERROR', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await test.throwsAsync(async () => {

      let query = ' delete    migration \
                    where     migration.name = \'execute(...) throws SQLITE_ERROR\''

      /* c8 ignore next 2 */
      await database.execute(query)

    }, { 'code': 'SQLITE_ERROR' })

  } finally {
    await database.close()
  }

})

Test.serial('get(\'...\', { ... }) throws SQLITE_ERROR', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await test.throwsAsync(async () => {

      let query = ' select    migration.name \
                    from      migration \
                    where     migration.name = $name'

      /* c8 ignore next 2 */
      await database.get(query, { '$name': 'test-migration' })

    }, { 'code': 'SQLITE_ERROR' })

  } finally {
    await database.close()
  }

})

Test.serial('all(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')

    await test.notThrowsAsync(async () => {

      let query = ' select    migration.name \
                    from      migration \
                    order by  migration.name'

      let [ row ] = await database.all(query)
      test.is(row.name, 'test-migration')

    })

  } finally {
    await database.close()
  }

})

Test.serial('all(\'...\', { ... })', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')

    await test.notThrowsAsync(async () => {

      let query = ' select    migration.name \
                    from      migration \
                    where     migration.name = $name'

      let [ row ] = await database.all(query, { '$name': 'test-migration' })
      test.is(row.name, 'test-migration')

    })

  } finally {
    await database.close()
  }

})

Test.serial('all(\'...\', { ... }) throws SQLITE_ERROR', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await test.throwsAsync(async () => {

      let query = ' select    migration.name \
                    from      migration \
                    where     migration.name = $name'

      /* c8 ignore next 2 */
      await database.all(query, { '$name': 'test-migration' })

    }, { 'code': 'SQLITE_ERROR' })

  } finally {
    await database.close()
  }

})

Test.serial('explain(\'...\', { ... })', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new CreateTableMigration(database)).install()
    await (new CreateIndexMigrationByNameInstalled(database)).install()

    await database.installMigration('test-migration')

    await test.notThrowsAsync(async () => {

      let query = ' select      true \
                    from        migration \
                    indexed by  migrationByNameInstalled \
                    where       migration.name = $name and \
                                migration.isInstalled = true'

      let [ row ] = await database.explain(query, { '$name': 'test-migration' })
      
      test.log(row.detail)
      test.is(row.detail, 'SEARCH TABLE migration USING COVERING INDEX migrationByNameInstalled (name=? AND isInstalled=?)')

    })

  } finally {
    await database.close()
  }

})

Test.serial('explain(\'...\', { ... }) throws SQLITE_ERROR', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await test.throwsAsync(async () => {

      let query = ' select      true \
                    from        migration \
                    where       migration.name = $name and \
                                migration.isInstalled = true'

      /* c8 ignore next 2 */
      await database.explain(query, { '$name': 'test-migration' })

    }, { 'code': 'SQLITE_ERROR' })

  } finally {
    await database.close()
  }

})
