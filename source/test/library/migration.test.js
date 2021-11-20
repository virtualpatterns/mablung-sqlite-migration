import { CreateLoggedDatabase, CreateLoggedMigration } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database, Migration } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/20211028004347-create-table-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/20211028004725-create-index-migration-by-name.js'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)
const Require = __require

const DatabasePath = FilePath.replace('/release/', '/data/').replace('.test.js', '.db')
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedDatabase = CreateLoggedDatabase(Database, LogPath)
const LoggedMigration = CreateLoggedMigration(Migration, LoggedDatabase)
const LoggedCreateTableMigration = CreateLoggedMigration(CreateTableMigration, LoggedDatabase)
const LoggedCreateIndexMigrationByName = CreateLoggedMigration(CreateIndexMigrationByName, LoggedDatabase)

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(DatabasePath)
})

Test.serial('Migration(\'...\', ...)', (test) => {
  test.notThrows(() => { new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, new LoggedDatabase(DatabasePath)) })
})

Test.serial('isInstalled() returns false if table not installed', async (test) => {
  test.is(await (new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, new LoggedDatabase(DatabasePath))).isInstalled(), false)
})

Test.serial('isInstalled() returns false if index not installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {
    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    test.is(await (new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)).isInstalled(), false)
  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns false when not installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    test.is(await (new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)).isInstalled(), false)

  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns true when installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    let migration = new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)

    await migration.install()
    test.is(await migration.isInstalled(), true)

  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns false when uninstalled', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    let migration = new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)

    await migration.install()
    await migration.uninstall()

    test.is(await migration.isInstalled(), false)

  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() throws Error', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  let isMigrationInstalledStub = Sinon
    .stub(database, 'isMigrationInstalled')
    .rejects(new Error())
  
  try {

    await database.open()

    try {

      await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
      await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

      await test.throwsAsync((new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)).isInstalled(), { 'instanceOf': Error })

    } finally {
      await database.close()
    }

  } finally {
    isMigrationInstalledStub.restore()
  }

})

Test.serial('install()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    let migration = new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)

    await test.notThrowsAsync(migration.install())

  } finally {
    await database.close()
  }

})

Test.serial('uninstall()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(Require.resolve('../../library/migration/20211028004347-create-table-migration.js'), database)).install()
    await (new LoggedCreateIndexMigrationByName(Require.resolve('../../library/migration/20211028004725-create-index-migration-by-name.js'), database)).install()

    let migration = new LoggedMigration(`${FolderPath}/migration/does-not-exist.js`, database)

    await test.notThrowsAsync(migration.install())
    await test.notThrowsAsync(migration.uninstall())

  } finally {
    await database.close()
  }

})

Test.serial('getMigration(\'...\') (not logged)', async (test) => {

  let migration = await Migration.getMigration(DatabasePath)

  test.is(migration.length, 4)
  test.is(migration[0].name, '20211027025141-initial')
  test.is(migration[1].name, '20211028004347-create-table-migration')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
  test.is(await migration[2].isInstalled(), false)
  test.is(migration[3].name, '20211101125133-initial')
  test.is(await migration[3].isInstalled(), false)

})

Test.serial('getMigration(\'...\') (logged)', async (test) => {

  let migration = await LoggedMigration.getMigration(DatabasePath)

  test.is(migration.length, 4)
  test.is(migration[0].name, '20211027025141-initial')
  test.is(migration[1].name, '20211028004347-create-table-migration')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
  test.is(await migration[2].isInstalled(), false)
  test.is(migration[3].name, '20211101125133-initial')
  test.is(await migration[3].isInstalled(), false)

})

Test.serial('getMigration(...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    let migration = await LoggedMigration.getMigration(database)

    test.is(migration.length, 4)
    test.is(migration[0].name, '20211027025141-initial')
    test.is(migration[1].name, '20211028004347-create-table-migration')
    test.is(await migration[1].isInstalled(), false)
    test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
    test.is(await migration[2].isInstalled(), false)
    test.is(migration[3].name, '20211101125133-initial')
    test.is(await migration[3].isInstalled(), false)

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\')', async (test) => {

  await LoggedMigration.installMigration(DatabasePath)

  let migration = await LoggedMigration.getMigration(DatabasePath)

  test.is(migration.length, 4)
  test.is(migration[0].name, '20211027025141-initial')
  test.is(await migration[0].isInstalled(), true)
  test.is(migration[1].name, '20211028004347-create-table-migration')
  test.is(await migration[1].isInstalled(), true)
  test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
  test.is(await migration[2].isInstalled(), true)
  test.is(migration[3].name, '20211101125133-initial')
  test.is(await migration[3].isInstalled(), true)

})

Test.serial('installMigration(...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await LoggedMigration.installMigration(database)

    let migration = await LoggedMigration.getMigration(database)

    test.is(migration.length, 4)
    test.is(migration[0].name, '20211027025141-initial')
    test.is(await migration[0].isInstalled(), true)
    test.is(migration[1].name, '20211028004347-create-table-migration')
    test.is(await migration[1].isInstalled(), true)
    test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
    test.is(await migration[2].isInstalled(), true)
    test.is(migration[3].name, '20211101125133-initial')
    test.is(await migration[3].isInstalled(), true)

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\')', async (test) => {

  await LoggedMigration.installMigration(DatabasePath)
  await LoggedMigration.uninstallMigration(DatabasePath)

  let migration = await LoggedMigration.getMigration(DatabasePath)

  test.is(migration.length, 4)
  test.is(migration[0].name, '20211027025141-initial')
  test.is(await migration[0].isInstalled(), false)
  test.is(migration[1].name, '20211028004347-create-table-migration')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
  test.is(await migration[2].isInstalled(), false)
  test.is(migration[3].name, '20211101125133-initial')
  test.is(await migration[3].isInstalled(), false)

})

Test.serial('uninstallMigration(...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await LoggedMigration.installMigration(database)
    await LoggedMigration.uninstallMigration(database)

    let migration = await LoggedMigration.getMigration(database)

    test.is(migration.length, 4)
    test.is(migration[0].name, '20211027025141-initial')
    test.is(await migration[0].isInstalled(), false)
    test.is(migration[1].name, '20211028004347-create-table-migration')
    test.is(await migration[1].isInstalled(), false)
    test.is(migration[2].name, '20211028004725-create-index-migration-by-name')
    test.is(await migration[2].isInstalled(), false)
    test.is(migration[3].name, '20211101125133-initial')
    test.is(await migration[3].isInstalled(), false)

  } finally {
    await database.close()
  }

})

// Test('uninstallMigration(databasePath)', async (test) => {

//   let databasePath = 'process/data/uninstall-migration.db'
//   await FileSystem.ensureDir(Path.dirname(databasePath))

//   await Migration.installMigration(databasePath)
//   await Migration.uninstallMigration(databasePath)

//   let migration = await Migration.getMigration(databasePath)

//   test.is(migration.length, 3)

//   test.is(await migration[0].isInstalled(), false)
//   test.is(await migration[1].isInstalled(), false)
//   test.is(await migration[2].isInstalled(), false)

// })
