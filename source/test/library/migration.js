import Path from 'path'

import { Database } from './database.js'
import { Migration as BaseMigration } from '../../index.js'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database)
  }

  static createDatabase(...parameter) {
    return new Database(...parameter)
  }

  static async getMigration(...parameter) {
    return (await Promise.all([ super.getMigration(...parameter), super.getMigrationFromPath(`${FolderPath}/migration`, [ '*.js' ], [ 'template.js' ], ...parameter) ])).flat().sort()
  }

}

export { Migration }