import { CreateLoggedProcess } from '@virtualpatterns/mablung-worker/test'
import { Migration } from '@virtualpatterns/mablung-sqlite-migration'
import { SpawnedProcess } from '@virtualpatterns/mablung-worker'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const Process = process
const Require = __require

const DatabasePath = FilePath.replace('/release/', '/data/').replace('.test.js', '.db')
const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.js$/, '.log')
const LoggedProcess = CreateLoggedProcess(SpawnedProcess, LogPath)

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(DatabasePath)
})

Test.serial('list', async (test) => {

  let process = new LoggedProcess(Process.env.NPX_PATH, [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'list', DatabasePath
  ])

  test.is(await process.whenExit(), 0)

})

Test.serial('install', async (test) => {

  let process = new LoggedProcess(Process.env.NPX_PATH, [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'install', DatabasePath
  ])

  test.is(await process.whenExit(), 0)
  
  let migration = await Migration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(await migration[0].isInstalled(), true)
  test.is(await migration[1].isInstalled(), true)
  test.is(await migration[2].isInstalled(), true)

})

Test.serial('uninstall', async (test) => {

  let process = null

  process = new LoggedProcess(Process.env.NPX_PATH, [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'install', DatabasePath
  ])

  await process.whenExit()

  process = new LoggedProcess(Process.env.NPX_PATH, [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'uninstall', DatabasePath
  ])

  test.is(await process.whenExit(), 0)

  let migration = await Migration.getMigration(Migration.defaultFrom, Migration.defaultTo, DatabasePath)

  test.is(migration.length, 3)
  test.is(await migration[0].isInstalled(), false)
  test.is(await migration[1].isInstalled(), false)
  test.is(await migration[2].isInstalled(), false)

})
