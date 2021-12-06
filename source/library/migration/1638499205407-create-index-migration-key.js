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
      return this.database.existsIndex('migrationKey')
    } finally {
      await this.database.close()
    }

  }

  install() {

    let statement = ' create unique index migrationKey on migration ( \
                        name, \
                        whenInstalled ) '

    return this.database.run(statement)
  
  }

  uninstall() {
    return this.database.run('drop index migrationKey')
  }

}

export { Migration }
