import { Console } from '@virtualpatterns/mablung-console'
import { format as Format } from 'sql-formatter'
import Is from '@pwn/is'

export function CreateLoggedDatabase(databaseClass, userLogPath, userLogOption = {}, userConsoleOption = {}) {

  class LoggedDatabase extends databaseClass {

    constructor(...argument) {
      super(...argument)
    }

    async open() {

      let count = await super.open()

      if (Is.equal(count, 1)) {

        let logPath = userLogPath
        let logOption = userLogOption

        let consoleOption = userConsoleOption

        this.console = new Console(logPath, logOption, consoleOption)
        
        this.console.log('- Database#open() --------------------------------')
        this.console.log()

        this.database.on('trace', this.onTraceHandler = (statement) => {
          // console.log('Database.on(\'trace\', this.onTraceHandler = (statement) => { ... })')

          try {
            this.onTrace(statement)
          } catch (error) {
            this.console.error(error)
          }

        })

      }

      return count

    }

    onTrace(statement) {

      try {
        this.console.log(Format(statement))
      } catch (error) {

        this.console.error(error)
        this.console.error()

        this.console.log(statement)

      }

      this.console.log()

    }

    async close() {

      let count = await super.close()

      if (Is.equal(count, 0)) {

        this.database.off('trace', this.onTraceHandler)
        delete this.onTraceHandler

        this.console.log('- Database#close() -------------------------------')
        this.console.close()

      }

      return count

    }

  }

  return LoggedDatabase

}
