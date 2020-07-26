import '@virtualpatterns/mablung-source-map-support/install.js'
import FileSystem from 'fs-extra'
import SQLFormat from 'sql-formatter'

import { Database } from '../library/database.js'
import { Migration } from '../library/migration.js'

async function main() {

  try {

    let databaseFolderPath = 'process/data'
    let databasePath0 = `${databaseFolderPath}/data0.db`
    let databasePath1 = `${databaseFolderPath}/data1.db`

    await FileSystem.ensureDir(databaseFolderPath)
  
    let database0 = new Database(databasePath0)
    let database1 = new Database(databasePath1)

    await Promise.all([Migration.installMigration(database0), Migration.installMigration(database1)])

    database0.on('trace', async (statement) => {

      console.log('-'.repeat(80))
      console.log('Database.on(\'trace\', async (statement) => { ... })')
      console.log('-'.repeat(80))
      console.log()
      console.log(SQLFormat.format(statement))
      console.log()

      let row = await database1.get(`explain query plan ${statement}`)

      if (row) {
        console.log(row.detail)
        console.log()
      }

    })

    await Promise.all([database0.open(), database1.open()])

    try {

      // await Migration.installMigration(database0)
      await database0.isMigrationInstalled('00000000000000-create-table-migration')
      // await database0.installMigration('abc')
      // await database0.uninstallMigration('abc')
      // await database0.existsTableMigration()
      // await database0.existsIndexMigration()

    } finally {
      await Promise.all([database0.close(), database1.close()])
    }

  } catch (error) {
    console.error(error)
  }

}

main()