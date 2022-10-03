// Copyright (c) 2019, Daniel Martí <mvdan@mvdan.cc>
// See LICENSE for licensing information

// +build ignore

package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	pkgs, err := listPackages(context.TODO(), nil,
		"cmd/gofmt",

		// These are internal cmd dependencies. Copy them.
		"cmd/internal/diff",
	)
	if err != nil {
		panic(err)
	}
	for _, pkg := range pkgs {
		if pkg.ImportPath == "cmd/gofmt" {
			copyGofmt(pkg)
		} else {
			parts := strings.Split(pkg.ImportPath, "/")
			copyInternal(pkg, filepath.Join(parts[1:]...))
		}
	}
}

type Module struct {
	Path      string       // module path
	Version   string       // module version
	Versions  []string     // available module versions (with -versions)
	Replace   *Module      // replaced by this module
	Time      *time.Time   // time version was created
	Update    *Module      // available update, if any (with -u)
	Main      bool         // is this the main module?
	Indirect  bool         // is this module only an indirect dependency of main module?
	Dir       string       // directory holding files for this module, if any
	GoMod     string       // path to go.mod file used when loading this module, if any
	GoVersion string       // go version used in module
	Error     *ModuleError // error loading module
}

type ModuleError struct {
	Err string // the error itself
}

type Package struct {
	Dir           string   // directory containing package sources
	ImportPath    string   // import path of package in dir
	ImportComment string   // path in import comment on package statement
	Name          string   // package name
	Doc           string   // package documentation string
	Target        string   // install path
	Shlib         string   // the shared library that contains this package (only set when -linkshared)
	Goroot        bool     // is this package in the Go root?
	Standard      bool     // is this package part of the standard Go library?
	Stale         bool     // would 'go install' do anything for this package?
	StaleReason   string   // explanation for Stale==true
	Root          string   // Go root or Go path dir containing this package
	ConflictDir   string   // this directory shadows Dir in $GOPATH
	BinaryOnly    bool     // binary-only package (no longer supported)
	ForTest       string   // package is only for use in named test
	Export        string   // file containing export data (when using -export)
	Module        *Module  // info about package's containing module, if any (can be nil)
	Match         []string // command-line patterns matching this package
	DepOnly       bool     // package is only a dependency, not explicitly listed

	// Source files
	GoFiles         []string // .go source files (excluding CgoFiles, TestGoFiles, XTestGoFiles)
	CgoFiles        []string // .go source files that import "C"
	CompiledGoFiles []string // .go files presented to compiler (when using -compiled)
	IgnoredGoFiles  []string // .go source files ignored due to build constraints
	CFiles          []string // .c source files
	CXXFiles        []string // .cc, .cxx and .cpp source files
	MFiles          []string // .m source files
	HFiles          []string // .h, .hh, .hpp and .hxx source files
	FFiles          []string // .f, .F, .for and .f90 Fortran source files
	SFiles          []string // .s source files
	SwigFiles       []string // .swig files
	SwigCXXFiles    []string // .swigcxx files
	SysoFiles       []string // .syso object files to add to archive
	TestGoFiles     []string // _test.go files in package
	XTestGoFiles    []string // _test.go files outside package

	// Cgo directives
	CgoCFLAGS    []string // cgo: flags for C compiler
	CgoCPPFLAGS  []string // cgo: flags for C preprocessor
	CgoCXXFLAGS  []string // cgo: flags for C++ compiler
	CgoFFLAGS    []string // cgo: flags for Fortran compiler
	CgoLDFLAGS   []string // cgo: flags for linker
	CgoPkgConfig []string // cgo: pkg-config names

	// Dependency information
	Imports      []string          // import paths used by this package
	ImportMap    map[string]string // map from source import to ImportPath (identity entries omitted)
	Deps         []string          // all (recursively) imported dependencies
	TestImports  []string          // imports from TestGoFiles
	XTestImports []string          // imports from XTestGoFiles

	// Error information
	Incomplete bool            // this package or a dependency has an error
	Error      *PackageError   // error loading package
	DepsErrors []*PackageError // errors loading dependencies
}

type PackageError struct {
	ImportStack []string // shortest path from package named on command line to this one
	Pos         string   // position of error (if present, file:line:col)
	Err         string   // the error itself
}

func getEnv(env []string, name string) string {
	for _, kv := range env {
		if i := strings.IndexByte(kv, '='); i > 0 && name == kv[:i] {
			return kv[i+1:]
		}
	}
	return ""
}

// listPackages is a wrapper for 'go list -json -e', which can take arbitrary
// environment variables and arguments as input. The working directory can be
// fed by adding $PWD to env; otherwise, it will default to the current
// directory.
//
// Since -e is used, the returned error will only be non-nil if a JSON result
// could not be obtained. Such examples are if the Go command is not installed,
// or if invalid flags are used as arguments.
//
// Errors encountered when loading packages will be returned for each package,
// in the form of PackageError. See 'go help list'.
func listPackages(ctx context.Context, env []string, args ...string) (pkgs []*Package, finalErr error) {
	goArgs := append([]string{"list", "-json", "-e"}, args...)
	cmd := exec.CommandContext(ctx, "go", goArgs...)
	cmd.Env = env
	cmd.Dir = getEnv(env, "PWD")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, err
	}
	var stderrBuf bytes.Buffer
	cmd.Stderr = &stderrBuf
	defer func() {
		if finalErr != nil && stderrBuf.Len() > 0 {
			// TODO: wrap? but the format is backwards, given that
			// stderr is likely multi-line
			finalErr = fmt.Errorf("%v\n%s", finalErr, stderrBuf.Bytes())
		}
	}()

	if err := cmd.Start(); err != nil {
		return nil, err
	}
	dec := json.NewDecoder(stdout)
	for dec.More() {
		var pkg Package
		if err := dec.Decode(&pkg); err != nil {
			return nil, err
		}
		pkgs = append(pkgs, &pkg)
	}
	if err := cmd.Wait(); err != nil {
		return nil, err
	}
	return pkgs, nil
}

func readFile(path string) string {
	body, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return string(body)
}

func writeFile(path, body string) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		panic(err)
	}
	if err := ioutil.WriteFile(path, []byte(body), 0o644); err != nil {
		panic(err)
	}
}

func sourceFiles(pkg *Package) (paths []string) {
	var combined []string
	for _, list := range [...][]string{
		pkg.GoFiles,
		pkg.IgnoredGoFiles,
	} {
		for _, name := range list {
			if strings.HasSuffix(name, "_test.go") {
				// IgnoredGoFiles can contain test files too.
				continue
			}
			combined = append(combined, filepath.Join(pkg.Dir, name))
		}
	}
	return combined
}

const (
	extraImport = `gformat "mvdan.cc/gofumpt/format"; `

	extraSrcLangVersion = `
		if *langVersion == "" {
			out, err := exec.Command("go", "list", "-m", "-f", "{{.GoVersion}}").Output()
			out = bytes.TrimSpace(out)
			if err == nil && len(out) > 0 {
				*langVersion = string(out)
			}
		}
		`
	extraVersion = `
		// Print the gofumpt version if the user asks for it.
		if *showVersion {
			printVersion()
			return
		}
		`
	extraFormat = `
		// Apply gofumpt's changes before we print the code in gofmt's format.
		` + extraSrcLangVersion + `
		gformat.File(fileSet, file, gformat.Options{
			LangVersion: *langVersion,
			ExtraRules:  *extraRules,
		})
		`
)

func copyGofmt(pkg *Package) {
	for _, path := range sourceFiles(pkg) {
		body := readFile(path)
		body = fixImports(body)
		name := filepath.Base(path)
		switch name {
		case "doc.go":
			continue // we have our own
		case "gofmt.go":
			if i := strings.Index(body, "\t\"mvdan.cc/gofumpt"); i > 0 {
				body = body[:i] + "\n" + extraImport + "\n" + body[i:]
			}
			if i := strings.Index(body, "if *cpuprofile !="); i > 0 {
				body = body[:i] + "\n" + extraVersion + "\n" + body[i:]
			}
			if i := strings.Index(body, "res, err := format("); i > 0 {
				body = body[:i] + "\n" + extraFormat + "\n" + body[i:]
			}
		}
		body = strings.Replace(body, "gofmt", "gofumpt", -1)
		writeFile(name, body)
	}
}

func copyInternal(pkg *Package, dir string) {
	for _, path := range sourceFiles(pkg) {
		body := readFile(path)
		body = fixImports(body)
		name := filepath.Base(path)
		writeFile(filepath.Join(dir, name), body)
	}
}

func fixImports(body string) string {
	body = strings.Replace(body,
		"cmd/internal/",
		"mvdan.cc/gofumpt/internal/",
		-1)
	return body
}
