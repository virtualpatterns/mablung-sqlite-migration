import { CreateLoggedMigration } from '@virtualpatterns/mablung-sqlite-migration/test'
import { Database, Migration } from '@virtualpatterns/mablung-sqlite-migration'
import Test from 'ava'

Test.serial('CreateLoggedMigration(..., ...)', (test) => {
  test.notThrows(() => { CreateLoggedMigration(Migration, Database) })
})
