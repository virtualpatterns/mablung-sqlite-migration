
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsIndex('migrationByNameIsInstalled')
    } finally {
      await this.database.close()
    }

  }

  install() {

    let statement = ' create index migrationByNameIsInstalled on migration ( \
                        name, \
                        isInstalled )'

    return this.database.run(statement)
  
  }

  uninstall() {
    return this.database.run('drop index migrationByNameIsInstalled')
  }

}

export { Migration }
