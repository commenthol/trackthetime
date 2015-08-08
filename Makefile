all: 0.12

%:
	n $@ && npm test

.PHONY: all