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
      return this.database.existsTable('migration')
    } finally {
      await this.database.close()
    }

  }

  async install() {

    let statement = ' create table migration ( \
                        name not null, \
                        isInstalled not null, \
                        whenInstalled not null, \
                        isUnInstalled not null, \
                        whenUnInstalled, \
                        constraint migrationKey primary key ( name ) )'

    return this.database.run(statement)

  }

  async uninstall() {
    return this.database.run('drop table migration')
  }

}

export { Migration }
