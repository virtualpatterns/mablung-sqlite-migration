
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsTable('migration')
    } finally {
      await this.database.close()
    }

  }

  install() {

    let statement = ' create table migration ( \
                        name not null, \
                        isInstalled not null, \
                        whenInstalled not null, \
                        whenUnInstalled )'

    return this.database.run(statement)

  }

  uninstall() {
    return this.database.run('drop table migration')
  }

}

export { Migration }
