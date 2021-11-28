import Is from '@pwn/is'

import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(path, database) {
    super(Is.string(path) ? path : FilePath, Is.string(path) ? database : path)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsIndex('migrationByName')
    } finally {
      await this.database.close()
    }

  }

  async install() {
    return this.database.run('create index migrationByName on migration ( name, isInstalled, isUnInstalled )')
  }

  async uninstall() {
    return this.database.run('drop index migrationByName')
  }

}

export { Migration }
