import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsIndexMigrationByName()
    } finally {
      await this.database.close()
    }

  }

  async install() {

    let statement = ' create index migrationByNameIndex on migration ( \
                        name, \
                        installed, \
                        uninstalled )'

    return this.database.run(statement)

  }

  async uninstall() {
    return this.database.run('drop index migrationByNameIndex')
  }

}

export { Migration }
