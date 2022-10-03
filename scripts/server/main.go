// Command playground runs a TinyGo compiler as an API that can be used from a
// web application.
package main

// This file implements the HTTP frontend.

import (
	"compress/gzip"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/julienschmidt/httprouter"
)

const (
	cacheTypeLocal = iota + 1 // Cache to a local directory
	cacheTypeGCS              // Google Cloud Storage
)

var (
	// The channel to submit compile jobs to.
	compilerChan chan compilerJob

	// The cache directory where cached wasm files are stored.
	cacheDir string

	// The cache type: local or Google Cloud Storage.
	cacheType int
)

func main() {
	// Create a build cache directory.
	userCacheDir, err := os.UserCacheDir()
	if err != nil {
		log.Fatalln("could not find temporary directory:", err)
	}
	cacheDir = filepath.Join(userCacheDir, "tinygo-playground")
	err = os.MkdirAll(cacheDir, 0777)
	if err != nil {
		log.Fatalln("could not create temporary directory:", err)
	}

	cacheTypeFlag := flag.String("cache-type", "local", "cache type (local, gcs)")
	flag.Parse()

	switch *cacheTypeFlag {
	case "local":
		cacheType = cacheTypeLocal
	default:
		log.Fatalln("unrecognized cache type:", *cacheTypeFlag)
	}

	// Start the compiler goroutine in the background, that will serialize all
	// compile jobs.
	compilerChan = make(chan compilerJob)
	go backgroundCompiler(compilerChan)

	// Run the web server.
	router := httprouter.New()
	router.GET("/version", handlerInfo)
	router.POST("/api/fmt", handlerGofumpt)
	router.GET("/api/compile", handleCompile)
	router.POST("/api/compile", handleCompile)
	fmt.Println("Server Up")
	log.Fatal(http.ListenAndServe(":8737", router))
	fmt.Println("Server Down")
}

// handleCompile handles the /api/compile API endpoint. It first tries to serve
// from a cache and if that fails, compiles the submitted source code directly.
func handleCompile(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var source []byte
	if strings.HasPrefix(r.Header.Get("Content-Type"), "text/plain") {
		// Read the source from the POST request.
		var err error
		source, err = ioutil.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusUnprocessableEntity)
			return
		}
	} else {
		// Read the source from a form parameter.
		source = []byte(r.FormValue("code"))
	}
	// Hash the source code, used for the build cache.
	sourceHashRaw := sha256.Sum256([]byte(source))
	sourceHash := hex.EncodeToString(sourceHashRaw[:])

	format := r.FormValue("format")
	switch format {
	case "", "wasm":
		// Run code in the browser.
		format = "wasm"
	case "elf", "hex", "uf2":
		// Build a firmware that can be flashed directly to a development board.
	default:
		// Unrecognized format. Disallow to be sure (might introduce security
		// issues otherwise).
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Attempt to serve directly from the directory with cached files.
	filename := filepath.Join(cacheDir, "build-"+r.FormValue("target")+"-"+sourceHash+"."+format)
	fp, err := os.Open(filename)
	if err == nil {
		// File was already cached! Serve it directly.
		defer fp.Close()
		sendCompiledResult(w, fp, format)
		return
	}

	// Create a new compiler job, which will be executed in a single goroutine
	// (to avoid overloading the system).
	job := compilerJob{
		Source:       source,
		SourceHash:   sourceHash,
		Target:       r.FormValue("target"),
		Format:       format,
		Context:      r.Context(),
		ResultFile:   make(chan string),
		ResultErrors: make(chan []byte),
	}
	// Send the job for execution.
	compilerChan <- job
	// See how well that went, when it finishes.
	select {
	case filename := <-job.ResultFile:
		// Succesful compilation.
		fp, err := os.Open(filename)
		if err != nil {
			log.Println("could not open compiled file:", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer fp.Close()
		sendCompiledResult(w, fp, format)
	case buf := <-job.ResultErrors:
		// Failed compilation.
		w.Write(buf)
	}
}

// sendCompiledResult streams a wasm file while gzipping it during transfer.
func sendCompiledResult(w http.ResponseWriter, fp *os.File, format string) {
	switch format {
	case "wasm":
		w.Header().Set("Content-Type", "application/wasm")
	default:
		w.Header().Set("Content-Type", "application/octet-stream")
		w.Header().Set("Content-Disposition", "attachment; filename=firmware."+format)
	}
	w.Header().Set("Content-Encoding", "gzip")
	gw := gzip.NewWriter(w)
	_, err := io.Copy(gw, fp)
	if err != nil {
		log.Println("could not read compiled file:", err)
		return
	}
	gw.Close()
}

func handlerInfo(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Println("INFO", r)
	fmt.Fprintf(w, jsonResponse("Server is up", 0, ""))
}

func handlerGofumpt(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

	w.Header().Set("Access-Control-Allow-Origin", "*")

	res, err := processInput(r.Body, true)
	if err != nil {
		report(err)
	}
	fmt.Fprintf(w, jsonResponse("ok", 0, res))
}

func jsonResponse(msg string, err int, code string) string {
	var r Response
	r.Msg = msg
	r.Error = err
	r.Code = code
	j, _ := json.Marshal(r)
	return string(j)
}
