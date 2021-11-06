
export function CreateLoggedMigration(migrationClass, databaseClass) {
    
  class LoggedMigration extends migrationClass {

    constructor(...argument) {
      super(...argument)
    }

    static createDatabase(...argument) {
      return new databaseClass(...argument)
    }

  }

  return LoggedMigration

}
