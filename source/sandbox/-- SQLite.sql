-- SQLite
explain query plan
select      true
from        migration
indexed by  migrationIndex
where       migration.name = 'abc' and
            migration.installed is not null and
            migration.uninstalled is null
