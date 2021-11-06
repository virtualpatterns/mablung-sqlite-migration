import { CreateMigration, Migration as BaseMigration } from '@virtualpatterns/mablung-migration'
import Is from '@pwn/is'
import Path from 'path'

import { Database } from './database.js'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

class Migration extends CreateMigration(BaseMigration, Path.normalize(`${FolderPath}/../../source/library/migration`), Path.normalize(`${FolderPath}/../../source/library/migration/template.js`), `${FolderPath}/migration`) {

  constructor(path, database) {
    super(path)
    this.database = database
  }

  async isInstalled() {

    let isInstalled = null

    await this.database.open()

    try {
      isInstalled = await this.database.isMigrationInstalled(this.name)
    } catch (error) {

      switch (true) {
        case Is.equal(error.message, 'SQLITE_ERROR: no such table: migration'):
        case Is.equal(error.message, 'SQLITE_ERROR: no such index: migrationByNameIndex'):
          return false
        default:
          throw error
      }

    } finally {
      await this.database.close()
    }

    return isInstalled

  }

  install() {
    return this.database.installMigration(this.name)
  }

  uninstall() {
    return this.database.uninstallMigration(this.name)
  }

  static createDatabase(...argument) {
    return new Database(...argument)
  }

  static getRawMigration(...argument) { // argument is [ database ] or [ databasePath ]

    let [ database ] = argument
    let [ databasePath ] = argument

    if (database instanceof Database) {
      databasePath = database.databasePath
    } else {
      database = this.createDatabase(databasePath)
    }

    return super.getRawMigration(database)
  
  }

  // static getRawMigrationFromPath(path, includePattern, excludePattern, ...argument) { // argument is [ database ] or [ databasePath ]

  //   let [ database ] = argument
  //   let [ databasePath ] = argument

  //   if (database instanceof Database) {
  //     databasePath = database.databasePath
  //   } else {
  //     database = this.createDatabase(databasePath)
  //   }

  //   return super.getRawMigrationFromPath(path, includePattern, excludePattern, database)

  // }

  static async installMigration(...argument) { // argument is [ database ] or [ databasePath ]

    let [ database ] = argument
    let [ databasePath ] = argument

    if (database instanceof Database) {
      databasePath = database.databasePath
    } else {
      database = this.createDatabase(databasePath)
    }

    await database.open()

    try {
      await super.installMigration(database)
    } finally {
      await database.close()
    }

  }

  static async uninstallMigration(...argument) { // argument is [ database ] or [ databasePath ]
  
    let [ database ] = argument
    let [ databasePath ] = argument

    if (database instanceof Database) {
      databasePath = database.databasePath
    } else {
      database = this.createDatabase(databasePath)
    }

    await database.open()

    try {
      await super.uninstallMigration(database)
    } finally {
      await database.close()
    }

  }
  
}

export { Migration }
