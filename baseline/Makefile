LATEX=pdflatex
LATEXMK=latexmk

MAIN=main
TEXS := $(shell find . -name '*.tex')
TITLE=baseline

all: build

build: $(MAIN).pdf

install: build
	cp -v $(MAIN).pdf $(out)/$(TITLE).pdf

clean:
	$(LATEXMK) -C

.PHONY: all build install clean

%.pdf: %.tex $(TEXS)
	$(LATEXMK) -pdf $<
