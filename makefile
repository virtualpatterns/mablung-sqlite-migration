
ifeq ($(origin mablung-makefile-path),undefined)
export mablung-makefile-path := $(shell npx mablung-makefile get-path)
endif

include $(mablung-makefile-path)

# "refresh": "rm -Rf node_modules package-lock.json && npm install",
# "upgrade:10": "npm-check-updates --upgrade",
# "upgrade:20": "shx rm -f package-lock.json",
# "upgrade:30": "npm install",
# "upgrade": "run-s --silent upgrade:*",
# "clean": "shx rm -Rf coverage process release",
# "lint:10": "eslint --ignore-path .gitignore source",
# "lint:20": "check-dependency",
# "lint": "run-s --silent lint:*",
# "build:10": "babel source --copy-files --extensions .cjs,.js --keep-file-extension --out-dir release --source-maps",
# "build": "run-s --silent clean lint build:*",
# "test:10": "c8 ava",
# "test": "run-s --silent build \"test:10 {@}\" --",
# "run:10": "node --no-warnings --unhandled-rejections=strict",
# "run": "run-s --silent build \"run:10 {@}\" --",
# "pre:push:10": "git add coverage release",
# "pre:push:20": "git commit --message=\"post-test\"",
# "pre:push": "run-s --silent test pre:push:*",
# "push:10": "npm version prerelease",
# "push:20": "git push origin master",
# "push": "run-s --silent pre:push push:*"
