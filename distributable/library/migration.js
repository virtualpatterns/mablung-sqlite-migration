import _URL from "url";import { Migration as BaseMigration } from '@virtualpatterns/mablung-migration';
import Path from 'path';
// import SQLFormat from 'sql-formatter'

import { Database } from './database.js';

const FilePath = _URL.fileURLToPath(import.meta.url);
const FolderPath = Path.dirname(FilePath);

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path);
    this._database = database;
  }

  /* c8 ignore next 3 */
  get database() {
    return this._database;
  }

  async isInstalled() {

    await this._database.open();

    try {
      return (await this._database.existsTableMigration()) && (
      await this._database.isMigrationInstalled(this._name));
    } finally {
      await this._database.close();
    }

  }

  install() {
    return this._database.installMigration(this._name);
  }

  uninstall() {
    return this._database.uninstallMigration(this._name);
  }

  static createMigration(name, path = Path.normalize(`${FolderPath}/../../source/library/migration`), templatePath = Path.normalize(`${FolderPath}/../../source/library/migration/template.js`)) {
    return super.createMigration(name, path, templatePath);
  }

  static async getMigration(...parameter) {// parameter is [ database ] or [ databasePath ]

    let [database] = parameter;
    let [databasePath] = parameter;

    if (database instanceof Database) {
      databasePath = database.path;
    } else {
      database = new Database(databasePath);
    }

    return (await Promise.all([super.getMigration(), this.getMigrationFromPath(`${FolderPath}/migration`, ['*.js'], ['template.js'], database)])).flat().sort();

  }

  static getMigrationFromPath(path, includePattern, excludePattern, ...parameter) {// parameter is [ database ] or [ databasePath ]

    let [database] = parameter;
    let [databasePath] = parameter;

    if (database instanceof Database) {
      databasePath = database.path;
    } else {
      database = new Database(databasePath);
    }

    return super.getMigrationFromPath(path, includePattern, excludePattern, database);

  }

  static async installMigration(...parameter) {// parameter is [ database ] or [ databasePath ]

    let [database] = parameter;
    let [databasePath] = parameter;
    // let onTrace = null

    if (database instanceof Database) {
      databasePath = database.path;
    } else {
      database = new Database(databasePath);
    }

    await database.open();
    // database.on('trace', onTrace = (statement) => {
    //   console.log('-'.repeat(80))
    //   console.log('Database.on(\'trace\', (statement) => { ... })')
    //   console.log('-'.repeat(80))
    //   console.log()
    //   console.log(SQLFormat.format(statement))
    //   console.log()
    // })

    try {
      await super.installMigration(database);
    } finally {
      // database.off('trace', onTrace)
      await database.close();
    }

  }

  static async uninstallMigration(...parameter) {// parameter is [ database ] or [ databasePath ]

    let [database] = parameter;
    let [databasePath] = parameter;
    // let onTrace = null

    if (database instanceof Database) {
      databasePath = database.path;
    } else {
      database = new Database(databasePath);
    }

    await database.open();
    // database.on('trace', onTrace = (statement) => {
    //   console.log('-'.repeat(80))
    //   console.log('Database.on(\'trace\', (statement) => { ... })')
    //   console.log('-'.repeat(80))
    //   console.log()
    //   console.log(SQLFormat.format(statement))
    //   console.log()
    // })

    try {
      await super.uninstallMigration(database);
    } finally {
      // database.off('trace', onTrace)
      await database.close();
    }

  }}



export { Migration };
//# sourceMappingURL=migration.js.map