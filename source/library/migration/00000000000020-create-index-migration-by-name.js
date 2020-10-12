import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  async isInstalled() {

    await this._database.open()

    try {
      return await this._database.existsIndexMigrationByName()
    } finally {
      await this._database.close()
    }

  }

  async install() {

    let statement = ' create index migrationByNameIndex on migration ( \
                        name, \
                        installed, \
                        uninstalled )'

    return this._database.run(statement)

  }

  async uninstall() {
    return this._database.run('drop index migrationByNameIndex')
  }

}

export default Migration
