
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  install() {
    return super.install()
  }

  uninstall() {
    return super.uninstall()
  }

}

export { Migration }
