import { Migration as BaseMigration } from '../migration.js'

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  async isInstalled() {

    await this.database.open()

    try {
      return this.database.existsTableMigration()
    } finally {
      await this.database.close()
    }

  }

  async install() {

    let statement = ' create table migration ( \
                        name not null, \
                        installed not null, \
                        uninstalled, \
                        constraint migrationKey primary key ( name ) )'

    return this.database.run(statement)

  }

  async uninstall() {
    return this.database.run('drop table migration')
  }

}

export { Migration }
