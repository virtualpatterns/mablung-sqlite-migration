
import { Database as BaseDatabase } from '../../index.js'

class Database extends BaseDatabase {

  constructor(...parameter) {
    super(...parameter)
  }

  explainIndexMigration() {

    let query = ' explain query plan \
                  select      true \
                  from        migration \
                  indexed by  migrationIndex \
                  where       migration.name = $name and \
                              migration.installed is not null and \
                              migration.uninstalled is null'

    return this.all(query, { '$name': 'Database.explainIndexMigration() { ... }' })

  }

  installNull() {}
  uninstallNull() {}

}

export { Database }