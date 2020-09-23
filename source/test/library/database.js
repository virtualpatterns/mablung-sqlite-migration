
import { Database as BaseDatabase } from '../../index.js'

class Database extends BaseDatabase {

  constructor(...parameter) {
    super(...parameter)
  }

  installNull() {}
  uninstallNull() {}

}

export { Database }