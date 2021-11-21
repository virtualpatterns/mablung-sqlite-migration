import { CreateLoggedDatabase } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database } from '@virtualpatterns/mablung-sqlite-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

const FilePath = __filePath

const DatabasePath = FilePath.replace('/release/', '/data/').replace('.test.js', '.db')
const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.beforeEach(() => {
  return FileSystem.remove(DatabasePath)
})

Test.serial('onTrace() throws Error', async (test) => {

  let database = new (CreateLoggedDatabase(Database, LogPath))(DatabasePath)

  let error = new Error()
  let onTraceStub = Sinon
    .stub(database, 'onTrace')
    .throws(error)

  try {

    await database.open()

    try {

      await Promise.all([
        new Promise((resolve, reject) => {

          let errorStub = Sinon
            .stub(database.console, 'error')
            .callsFake(function (...argument) {

              try {

                test.is(argument.length, 1)
                test.is(argument[0], error)

                resolve()

              /* c8 ignore next 3 */
              } catch (error) {
                reject(error)
              } finally {
                errorStub.restore()
              }

            })

        }),
        database.existsTableMigration()
      ])

    } finally {
      await database.close()
    }

  } finally {
    onTraceStub.restore()
  }

})
