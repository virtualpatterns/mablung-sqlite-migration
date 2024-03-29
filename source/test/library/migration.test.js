import { CreateLoggedDatabase, CreateLoggedMigration } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database, Migration } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

import { Migration as CreateTableMigration } from '../../library/migration/1638499024571-create-table-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/1638499205407-create-index-migration-by-name.js'
import { Migration as CreateIndexMigrationByNameIsInstalled } from '../../library/migration/1638499205408-create-index-migration-by-name-is-installed.js'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

const DatabasePath = FilePath.replace('/release/', '/data/').replace('.test.js', '.db')
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedDatabase = CreateLoggedDatabase(Database, LogPath)
const LoggedMigration = CreateLoggedMigration(Migration, LoggedDatabase)
const LoggedCreateTableMigration = CreateLoggedMigration(CreateTableMigration, LoggedDatabase)
const LoggedCreateIndexMigrationByName = CreateLoggedMigration(CreateIndexMigrationByName, LoggedDatabase)
const LoggedCreateIndexMigrationByNameIsInstalled = CreateLoggedMigration(CreateIndexMigrationByNameIsInstalled, LoggedDatabase)

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(DatabasePath)
})

Test.serial('Migration(...)', (test) => {
  test.notThrows(() => { new LoggedCreateTableMigration(new LoggedDatabase(DatabasePath)) })
})

Test.serial('isInstalled() returns false if table not created', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {
    test.is(await (new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)).isInstalled(), false)
  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns false if index not created', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(database)).install()

    test.is(await (new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)).isInstalled(), false)
  
  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns false when not installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(database)).install()
    await (new LoggedCreateIndexMigrationByName(database)).install()
    await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)

    test.is(await migration.isInstalled(), false)

  } finally {
    await database.close()
  }

})

Test.serial('isInstalled() returns true when installed', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(database)).install()
    await (new LoggedCreateIndexMigrationByName(database)).install()
    await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)

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

    await (new LoggedCreateTableMigration(database)).install()
    await (new LoggedCreateIndexMigrationByName(database)).install()
    await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)

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

      await (new LoggedCreateTableMigration(database)).install()
      await (new LoggedCreateIndexMigrationByName(database)).install()
      await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

      await test.throwsAsync((new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)).isInstalled(), { 'instanceOf': Error })

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

    await (new LoggedCreateTableMigration(database)).install()
    await (new LoggedCreateIndexMigrationByName(database)).install()
    await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)

    await test.notThrowsAsync(migration.install())

  } finally {
    await database.close()
  }

})

Test.serial('uninstall()', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await (new LoggedCreateTableMigration(database)).install()
    await (new LoggedCreateIndexMigrationByName(database)).install()
    await (new LoggedCreateIndexMigrationByNameIsInstalled(database)).install()

    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database)

    await migration.install()
    await test.notThrowsAsync(migration.uninstall())

  } finally {
    await database.close()
  }

})

Test.serial('getMigration(default, default, \'...\') (not logged)', async (test) => {

  let migration = await Migration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(migration[0].name, '1638499024571-create-table-migration')
  test.is(await migration[0].isInstalled(), false)
  test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
  test.is(await migration[2].isInstalled(), false)

})

Test.serial('getMigration(default, default, \'...\') (logged)', async (test) => {

  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(migration[0].name, '1638499024571-create-table-migration')
  test.is(await migration[0].isInstalled(), false)
  test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
  test.is(await migration[2].isInstalled(), false)

})

Test.serial('getMigration(default, default, ...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database)

    test.is(migration.length, 3)
    test.is(migration[0].name, '1638499024571-create-table-migration')
    test.is(await migration[0].isInstalled(), false)
    test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
    test.is(await migration[1].isInstalled(), false)
    test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
    test.is(await migration[2].isInstalled(), false)

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(default, default, \'...\')', async (test) => {

  await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(migration[0].name, '1638499024571-create-table-migration')
  test.is(await migration[0].isInstalled(), true)
  test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
  test.is(await migration[1].isInstalled(), true)
  test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
  test.is(await migration[2].isInstalled(), true)

})

Test.serial('installMigration(default, default, ...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, database)

    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database)

    test.is(migration.length, 3)
    test.is(migration[0].name, '1638499024571-create-table-migration')
    test.is(await migration[0].isInstalled(), true)
    test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
    test.is(await migration[1].isInstalled(), true)
    test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
    test.is(await migration[2].isInstalled(), true)

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(default, default, \'...\')', async (test) => {

  await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)
  await LoggedMigration.uninstallMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(migration[0].name, '1638499024571-create-table-migration')
  test.is(await migration[0].isInstalled(), false)
  test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
  test.is(await migration[1].isInstalled(), false)
  test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
  test.is(await migration[2].isInstalled(), false)

})

Test.serial('uninstallMigration(default, default, ...)', async (test) => {

  let database = new LoggedDatabase(DatabasePath)

  await database.open()

  try {

    await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, database)
    await LoggedMigration.uninstallMigration(Migration.defaultFrom, Migration.defaultTo, database)

    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database)

    test.is(migration.length, 3)
    test.is(migration[0].name, '1638499024571-create-table-migration')
    test.is(await migration[0].isInstalled(), false)
    test.is(migration[1].name, '1638499205407-create-index-migration-by-name')
    test.is(await migration[1].isInstalled(), false)
    test.is(migration[2].name, '1638499205408-create-index-migration-by-name-is-installed')
    test.is(await migration[2].isInstalled(), false)

  } finally {
    await database.close()
  }

})
