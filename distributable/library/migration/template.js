import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async install() {
    await super.install();
  }

  async uninstall() {
    await super.uninstall();
  }}



export default Migration;
//# sourceMappingURL=template.js.map