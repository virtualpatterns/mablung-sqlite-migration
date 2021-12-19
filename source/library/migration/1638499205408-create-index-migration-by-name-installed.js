
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsIndex('migrationByNameInstalled')
    } finally {
      await this.database.close()
    }

  }

  install() {

    let statement = ' create index migrationByNameInstalled on migration ( \
                        name, \
                        isInstalled )'

    return this.database.run(statement)
  
  }

  uninstall() {
    return this.database.run('drop index migrationByNameInstalled')
  }

}

export { Migration }
