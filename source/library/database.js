import EventEmitter from 'events'
// import SQLFormat from 'sql-formatter'
import SQLite from 'sqlite3'

class Database extends EventEmitter {

  constructor(path, mode = SQLite.OPEN_READWRITE | SQLite.OPEN_CREATE) {
    super()

    this._path = path
    this._mode = mode

    this._database = null
    this._count = 0

  }

  _onTrace(statement) {
    this.emit('trace', statement)
  }

  get path() {
    return this._path
  }

  /* c8 ignore next 3 */
  get mode() {
    return this._mode
  }

  open() {

    return new Promise((resolve, reject) => {

      if (this._count === 0) {
        
        this._database = new SQLite.Database(this._path, this._mode, (error) => {

          if (error) {
            reject(error)
          } else {

            this._database.on('trace', this.__onTrace = (statement) => {
              // console.log('Database.on(\'trace\', this.__onTrace = (statement) => { ... })')
                
              try {
                this._onTrace(statement)
              /* c8 ignore next 3 */
              } catch (error) {
                console.error(error)
              }

            })
    
            resolve(++this._count)

          }

        })

      } else if (this._count > 0) {
        resolve(++this._count)
      }

    })

  }

  /* c8 ignore next 3 */
  beginTransaction() {
    return this.run('begin transaction')
  }

  existsTableMigration() {
    return this.existsTable('migration')
  }

  createTableMigration() {

    let statement = ' create table migration ( \
                        name text not null, \
                        installed text not null, \
                        uninstalled text, \
                        constraint migrationKey primary key ( name ) )'

    return this.run(statement)

  }

  dropTableMigration() {
    return this.run('drop table migration')
  }

  existsIndexMigration() {
    return this.existsIndex('migrationIndex')
  }

  createIndexMigration() {

    let statement = ' create index migrationIndex on migration ( \
                        name, \
                        installed, \
                        uninstalled )'

    return this.run(statement)

  }

  dropIndexMigration() {
    return this.run('drop index migrationIndex')
  }

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

  isMigrationInstalled(name) {

    let query = ' select      true \
                  from        migration \
                  indexed by  migrationIndex \
                  where       migration.name = $name and \
                              migration.installed is not null and \
                              migration.uninstalled is null'

    return this.exists(query, { '$name': name })

  }

  installMigration(name) {

    let statement = ' insert or replace into migration (  name, \
                                                          installed, \
                                                          uninstalled ) \
                      values (  $name, \
                                datetime(\'now\', \'localtime\'), \
                                null )'

    return this.run(statement, { '$name': name })

  }

  uninstallMigration(name) {

    let statement = ' update      migration \
                      indexed by  migrationIndex \
                      set         uninstalled = datetime(\'now\', \'localtime\') \
                      where       name = $name and \
                                  installed is not null and \
                                  uninstalled is null'

    return this.run(statement, { '$name': name })

  }

  /* c8 ignore next 4 */
  commitTransaction() {
    return this.run('commit transaction')
  }

  /* c8 ignore next 4 */
  rollbackTransaction() {
    return this.run('rollback transaction')
  }

  run(statement, parameter = []) {
    // console.log('-'.repeat(80))
    // console.log('Database.run(statement, parameter)')
    // console.log('-'.repeat(80))
    // console.log()
    // console.log(SQLFormat.format(statement))
    // console.log()

    return new Promise((resolve, reject) => {

      this._database.run(statement, parameter, function(error) { // Note that this cannot be an arrow function because of the use of this

        if (error) {
          reject(error)
        } else {
          resolve({ 'numberOfChanges': this.changes })
        }

      })

    })

  }

  get(query, parameter = []) {
    // console.log('-'.repeat(80))
    // console.log('Database.get(query, parameter)')
    // console.log('-'.repeat(80))
    // console.log()
    // console.log(SQLFormat.format(query))
    // console.log()

    return new Promise((resolve, reject) => {

      this._database.get(query, parameter, (error, row) => {

        if (error) {
          reject(error)
        } else {
          resolve(row)
        }

      })

    })

  }

  async exists(query, parameter = []) {
    return (await this.get(query, parameter)) ? true : false
  }

  existsTable(name) {

    let query = ' select  true \
                  from    sqlite_master \
                  where   sqlite_master.type = \'table\' and \
                          sqlite_master.name = $name'

    return this.exists(query, { '$name': name })

  }

  existsIndex(name) {

    let query = ' select  true \
                  from    sqlite_master \
                  where   sqlite_master.type = \'index\' and \
                          sqlite_master.name = $name'

    return this.exists(query, { '$name': name })

  }

  all(query, parameter = []) {
    // console.log('-'.repeat(80))
    // console.log('Database.all(query, parameter)')
    // console.log('-'.repeat(80))
    // console.log()
    // console.log(SQLFormat.format(query))
    // console.log()

    return new Promise((resolve, reject) => {

      this._database.all(query, parameter, (error, row) => {

        if (error) {
          reject(error)
        } else {
          resolve(row)
        }

      })

    })

  }

  close() {

    return new Promise((resolve, reject) => {

      if (this._count === 1) {

        this._database.close((error) => {

          if (error) {
            reject(error)
          } else {

            this._database.off('trace', this.__onTrace)
            delete this.__onTrace

            this._database = null
            resolve(--this._count)

          }

        })

      } else if (this._count > 1) {
        resolve(--this._count)
      }

    })

  }

}

export { Database }
