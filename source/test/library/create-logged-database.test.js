import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.serial('CreateLoggedDatabase(..., \'...\')', (test) => {
  test.notThrows(() => { CreateLoggedDatabase(Database, LogPath) })
})

Test.serial('CreateLoggedDatabase(..., \'...\', { ... })', (test) => {
  test.notThrows(() => { CreateLoggedDatabase(Database, LogPath, {}) })
})

Test.serial('CreateLoggedDatabase(..., \'...\', { ... }, { ... })', (test) => {
  test.notThrows(() => { CreateLoggedDatabase(Database, LogPath, {}, {}) })
})
