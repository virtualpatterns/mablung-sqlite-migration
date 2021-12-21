
ifeq ($(origin mablung-makefile-environment-path),undefined)
export mablung-makefile-environment-path := $(shell npx mablung-makefile-environment get-path)
endif

include $(mablung-makefile-environment-path)

pre-run::
	$(eval export NPX_PATH = $(shell npx shx which npx))

pre-cover::
	$(eval export NPX_PATH = $(shell npx shx which npx))

pre-test::
	$(eval export NPX_PATH = $(shell npx shx which npx))
