all: 12 14

%:
	n $@ && npm test

docs:
	markedpp --githubids -i README.md -o README.md

.PHONY: all docs
