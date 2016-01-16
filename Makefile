all: 0.12 5.

%:
	n $@ && npm test

docs:
	markedpp --githubids -i README.md -o README.md

.PHONY: all docs