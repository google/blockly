// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"bytes"
	"flag"
	"fmt"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/scanner"
	"go/token"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	gformat "mvdan.cc/gofumpt/format"
)

// Keep these in sync with go/format/format.go.
const (
	tabWidth    = 8
	printerMode = printer.UseSpaces | printer.TabIndent | printerNormalizeNumbers

	// printerNormalizeNumbers means to canonicalize number literal prefixes
	// and exponents while printing. See https://golang.org/doc/go1.13#gofumpt.
	//
	// This value is defined in go/printer specifically for go/format and cmd/gofumpt.
	printerNormalizeNumbers = 1 << 30
)

var (
	fileSet    = token.NewFileSet() // per process FileSet
	exitCode   = 0
	parserMode = parser.ParseComments
)

type Response struct {
	Msg   string `json:"msg,omitempty"`
	Code  string `json:"code"`
	Error int    `json:"error"`
}

func report(err error) {
	scanner.PrintError(os.Stderr, err)
	exitCode = 2
}

func usage() {
	fmt.Fprintf(os.Stderr, "usage: gofumpt [flags] [path ...]\n")
	flag.PrintDefaults()
}

func isGoFile(f os.FileInfo) bool {
	// ignore non-Go files
	name := f.Name()
	return !f.IsDir() && !strings.HasPrefix(name, ".") && strings.HasSuffix(name, ".go")
}

// If in == nil, the source is the contents of the file with the given filename.
func processInput(in io.Reader, stdin bool) (string, error) {

	src, err := ioutil.ReadAll(in)
	if err != nil {
		return "", err
	}

	file, sourceAdj, indentAdj, err := parse(fileSet, "<standard input>", src, stdin)
	if err != nil {
		return "", err
	}

	ast.SortImports(fileSet, file)

	// Apply gofumpt's changes before we print the code in gofumpt's format.

	if *langVersion == "" {
		out, err := exec.Command("go", "list", "-m", "-f", "{{.GoVersion}}").Output()
		out = bytes.TrimSpace(out)
		if err == nil && len(out) > 0 {
			*langVersion = string(out)
		}
	}

	gformat.File(fileSet, file, gformat.Options{
		LangVersion: *langVersion,
		ExtraRules:  *extraRules,
	})

	res, err := format(fileSet, file, sourceAdj, indentAdj, src, printer.Config{Mode: printerMode, Tabwidth: tabWidth})
	if err != nil {
		return "", err
	}

	return string(res), nil
}

