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
//# sourceMappingURL=template.js.map