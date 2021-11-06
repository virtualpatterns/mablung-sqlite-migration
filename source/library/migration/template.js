import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  install() {
    return super.install()
  }

  uninstall() {
    return super.uninstall()
  }

}

export { Migration }
