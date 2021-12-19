import Is from '@pwn/is'
import SQLite from 'sqlite3'

class Database {

  constructor(userPath, userMode = SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE) {

    this.databasePath = userPath
    this.databaseMode = userMode

    this.database = null
    this.count = 0

  }

  async open() {

    if (Is.equal(this.count, 0)) {

      await new Promise((resolve, reject) => {

        this.database = new SQLite.Database(this.databasePath, this.databaseMode, (error) => {

          if (Is.nil(error)) {
            resolve()
          } else {
            reject(error)
          }

        })

      })
      
      await this.execute('  pragma foreign_keys = true; \
                            pragma automatic_index = false;')

    }

    return ++this.count

  }

  async close() {

    if (Is.equal(this.count, 1)) {

      await new Promise((resolve, reject) => {

        this.database.close((error) => {

          if (Is.nil(error)) {
            resolve()
          } else {
            reject(error)
          }

        })

      })

    }
      
    return --this.count

  }

  async isMigrationInstalled(name, isExplained = false) {

    let query = ' select      true \
                  from        migration \
                  indexed by  migrationByNameInstalled \
                  where       migration.name = $name and \
                              migration.isInstalled = true'

    return isExplained ? this.explain(query, { '$name': name }) : this.exists(query, { '$name': name })

  }

  async installMigration(name, isExplained = false) {

    let statement = ' insert or replace into migration (  name, \
                                                          isInstalled, \
                                                          whenInstalled, \
                                                          whenUnInstalled ) \
                      values (  $name, \
                                true, \
                                datetime(\'now\', \'utc\'), \
                                null )'

    return isExplained ? this.explain(statement, { '$name': name }) : this.run(statement, { '$name': name })

  }

  async uninstallMigration(name, isExplained = false) {

    // let statement = ' update      migration \
    //                   indexed by  migrationByNameWhen \
    //                   set         isUnInstalled = true, \
    //                               whenUnInstalled = datetime(\'now\', \'utc\') \
    //                   from        ( select      migration.name                as name, \
    //                                             max(migration.whenInstalled)  as maximumWhenInstalled \
    //                                 from        migration \
    //                                 indexed by  migrationByNameIs \
    //                                 where       migration.name = $name and \
    //                                             migration.isInstalled = true and \
    //                                             migration.isUninstalled = false \
    //                                 group by    migration.name ) as migrationMaximumWhenInstalled \
    //                   where       migration.name = migrationMaximumWhenInstalled.name and \
    //                               migration.whenInstalled = migrationMaximumWhenInstalled.maximumWhenInstalled'

    let statement = ' update      migration \
                      indexed by  migrationByName \
                      set         isInstalled = false, \
                                  whenUnInstalled = datetime(\'now\', \'utc\') \
                      where       name = $name'

    return isExplained ? this.explain(statement, { '$name': name }) : this.run(statement, { '$name': name })

  }

  async existsTable(name) {

    let query = ' select  true \
                  from    sqlite_master \
                  where   sqlite_master.type = \'table\' and \
                          sqlite_master.name = $name'

    return this.exists(query, { '$name': name })

  }

  async existsIndex(name) {

    let query = ' select  true \
                  from    sqlite_master \
                  where   sqlite_master.type = \'index\' and \
                          sqlite_master.name = $name'

    return this.exists(query, { '$name': name })

  }

  async exists(query, parameter = []) {
    return (await this.get(query, parameter)) ? true : false
  }
  
  async beginTransaction() {
    return this.run('begin transaction')
  }

  async commitTransaction() {
    return this.run('commit transaction')
  }

  async rollbackTransaction() {
    return this.run('rollback transaction')
  }

  async run(statement, parameter = []) {

    return new Promise((resolve, reject) => {

      this.database.run(statement, parameter, function (error) { // Note that this cannot be an arrow function because of the use of this

        if (Is.nil(error)) {
          resolve({
            'lastId': this.lastID,
            'numberOfChanges': this.changes
          })
        } else {
          reject(error)
        }

      })

    })

  }

  async execute(statement) {

    return new Promise((resolve, reject) => {

      this.database.exec(statement, (error) => {

        if (Is.nil(error)) {
          resolve()
        } else {
          reject(error)
        }

      })

    })

  }

  async get(query, parameter = []) {

    return new Promise((resolve, reject) => {

      this.database.get(query, parameter, (error, row) => {

        if (Is.nil(error)) {
          resolve(row)
        } else {
          reject(error)
        }

      })

    })

  }

  async all(query, parameter = []) {

    return new Promise((resolve, reject) => {

      this.database.all(query, parameter, (error, row) => {

        if (Is.nil(error)) {
          resolve(row)
        } else {
          reject(error)
        }

      })

    })

  }

  async explain(statement, parameter = []) {

    return new Promise((resolve, reject) => {

      this.database.all(`explain query plan \n${statement}`, parameter, (error, row) => {

        if (Is.nil(error)) {
          resolve(row)
        } else {
          reject(error)
        }

      })

    })

  }

}

export { Database }
