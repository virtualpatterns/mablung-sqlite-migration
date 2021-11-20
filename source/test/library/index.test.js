import Test from 'ava'

Test.before(async (test) => {
  test.context.index = await import('@virtualpatterns/mablung-sqlite-migration/test')
})

;[
  'CreateLoggedDatabase',
  'CreateLoggedMigration'
].forEach((name) => {

  Test(name, (test) => {
    test.truthy(test.context.index[name])
  })
  
})
