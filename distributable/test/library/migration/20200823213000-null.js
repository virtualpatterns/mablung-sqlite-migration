import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async install() {
    return super.install();
  }

  async uninstall() {
    return super.uninstall();
  }}



export default Migration;
//# sourceMappingURL=20200823213000-null.js.map