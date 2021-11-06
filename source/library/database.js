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

  existsTableMigration() {
    return this.existsTable('migration')
  }

  // createTableMigration() {

  //   let statement = ' create table migration ( \
  //                       name not null, \
  //                       installed not null, \
  //                       uninstalled, \
  //                       constraint migrationKey primary key ( name ) )'

  //   return this.run(statement)

  // }

  // dropTableMigration() {
  //   return this.run('drop table migration')
  // }

  existsIndexMigrationByName() {
    return this.existsIndex('migrationByNameIndex')
  }

  // createIndexMigration() {

  //   let statement = ' create index migrationByNameIndex on migration ( \
  //                       name, \
  //                       installed, \
  //                       uninstalled )'

  //   return this.run(statement)

  // }

  // dropIndexMigration() {
  //   return this.run('drop index migrationByNameIndex')
  // }

  // selectAllMigration() {

  //   let query = ' select    migration.name, \
  //                           migration.installed, \
  //                           migration.uninstalled \
  //                 from      migration \
  //                 order by  migration.name, \
  //                           migration.installed, \
  //                           migration.uninstalled'

  //   await this.open()
  //   return this.all(query)

  // }

  async isMigrationInstalled(name, isExplained = false) {

    let query = ' select      true \
                  from        migration \
                  indexed by  migrationByNameIndex \
                  where       migration.name = $name and \
                              migration.installed is not null and \
                              migration.uninstalled is null'

    return isExplained ? this.explain(query, { '$name': name }) : this.exists(query, { '$name': name })

  }

  async installMigration(name) {

    let statement = ' insert or replace into migration (  name, \
                                                          installed, \
                                                          uninstalled ) \
                      values (  $name, \
                                datetime(\'now\', \'localtime\'), \
                                null )'

    return this.run(statement, { '$name': name })

  }

  async uninstallMigration(name, isExplained = false) {

    let statement = ' update      migration \
                      indexed by  migrationByNameIndex \
                      set         uninstalled = datetime(\'now\', \'localtime\') \
                      where       name = $name and \
                                  installed is not null and \
                                  uninstalled is null'

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

  // async onOpen(fn) {

  //   await this.open()

  //   try {
  //     return await fn(this)
  //   } finally {
  //     await this.close()
  //   }

  // }

}

export { Database }
