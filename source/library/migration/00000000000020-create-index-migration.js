import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  async isInstalled() {

    await this._database.open()

    try {
      return await this._database.existsIndexMigration()
    } finally {
      await this._database.close()
    }

  }

  install() {
    return this._database.createIndexMigration()
  }

  uninstall() {
    return this._database.dropIndexMigration()
  }

}

export default Migration
