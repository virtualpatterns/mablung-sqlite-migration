import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  async install() {
    await this._database.installNull()
    await super.install()
  }

  async uninstall() {
    await this._database.uninstallNull()
    await super.uninstall()
  }

}

export default Migration
