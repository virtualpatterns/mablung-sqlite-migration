
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsIndex('migrationByName')
    } finally {
      await this.database.close()
    }

  }

  install() {
    return this.database.run('create unique index migrationByName on migration ( name )')
  }

  uninstall() {
    return this.database.run('drop index migrationByName')
  }

}

export { Migration }
