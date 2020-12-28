import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async isInstalled() {

    await this._database.open();

    try {
      return await this._database.existsTableMigration();
    } finally {
      await this._database.close();
    }

  }

  async install() {

    let statement = ' create table migration ( \
                        name not null, \
                        installed not null, \
                        uninstalled, \
                        constraint migrationKey primary key ( name ) )';

    return this._database.run(statement);

  }

  async uninstall() {
    return this._database.run('drop table migration');
  }}



export default Migration;
//# sourceMappingURL=00000000000010-create-table-migration.js.map