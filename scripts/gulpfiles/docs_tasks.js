const { execSync } = require('child_process');
const { Extractor } = require('markdown-tables-to-json');
const fs = require('fs');
const gulp = require('gulp');
const header = require('gulp-header');
const replace = require('gulp-replace');

const docsDir = 'docs';

/**
 * Run API Extractor to generate the intermediate json file.
 */
const generateApiJson = function(done) {
    execSync('api-extractor run --local', { stdio: 'inherit' });
    done();
}

/**
 * API Extractor output spuriously renames some functions. Undo that.
 * See https://github.com/microsoft/rushstack/issues/2534
 */
const removeRenames = function() {
    return gulp.src('temp/blockly.api.json')
        .pipe(replace('_2', ''))
        .pipe(gulp.dest('temp/'));
}

/**
 * Run API Documenter to generate the raw docs files.
 */
const generateDocs = function(done) {
    if (!fs.existsSync(docsDir)) {
        // Create the directory if it doesn't exist.
        // If it already exists, the contents will be deleted by api-documenter.
        fs.mkdirSync(docsDir);
    }
    execSync(`api-documenter markdown --input-folder temp --output-folder ${docsDir}`, { stdio: 'inherit' });
    done();
}

/**
 * Prepends the project and book metadata that devsite requires.
 */
const prependBook = function() {
    return gulp.src('docs/*.md')
        .pipe(header('Project: /blockly/_project.yaml\nBook: /blockly/_book.yaml\n\n'))
        .pipe(gulp.dest(docsDir));
}

/**
 * Creates a map of top-level pages to sub-pages.
 * This is used to create the `alternate_paths` data in the TOC.
 * All subpages must be linked to their top-level page in the TOC for the
 * left nav bar to remain correct after drilling down into a sub-page.
 * @param {string[]} allFiles All files in docs directory.
 * @returns {Map<string, string[]>}
 */
const buildAlternatePathsMap = function(allFiles) {
    let map = new Map();
    for (let file of allFiles) {
        // Get the name of the class/namespaces/variable/etc., i.e. the top-level page.
        let filePieces = file.split('.');
        let name = filePieces[1];
        if (!map.has(name)) {
            map.set(name, []);
        }
        if (filePieces[2] !== 'md') {
            // Don't add the top-level page to the map, only the sub-pages.
            // Add all sub-pages to the array for this page.
            map.get(name).push(file);
        }
    }
    return map;
}

/**
 * Create the _toc.yaml file used by devsite to create the leftnav.
 * This file is generated from the contents of `blockly.md` which contains links
 * to the other top-level API pages (each class, namespace, etc.).
 */
const createToc = function(done) {
    const fileContent = fs.readFileSync(`${docsDir}/blockly.md`, 'utf8');
    const files = fs.readdirSync(docsDir);
    const map = buildAlternatePathsMap(files);
    const referencePath = '/blockly/reference/js';
    let content = 'toc:\n';

    // Generate a section of TOC for each section/heading in the overview file.
    const sections = fileContent.split('##');
    for (let section of sections) {
        // This converts the md table in each section to a JS object
        const table = Extractor.extractObject(section, 'rows', false);
        if (!table) {
            continue;
        }
        // Get the name of the section, i.e. the text immediately after the `##` in the source doc
        const sectionName = section.split('\n')[0].trim();
        content += `- heading: ${sectionName}\n`
        for (let row in table) {
            // After going through the Extractor, the markdown is now HTML.
            // Each row in the table is now a link (anchor tag).
            // Get the target of the link, excluding the first `.` since we don't want a relative path.
            const path = /href="\.(.*?)"/.exec(row)?.[1];
            // Get the name of the link (text in between the <a> and </a>)
            const name = /">(.*?)</.exec(row)?.[1];
            if (!path || !name) {
                continue;
            }
            content += `- title: ${name}\n`;
            content += `  path: ${referencePath}${path}\n`;
            // Get the list of sub-pages for this page.
            let pages = map.get(path.split('.')[1]);
            if (pages?.length) {
                content += `  alternate_paths:\n`;
                for (let page of pages) {
                    content += `  - ${referencePath}/${page}\n`;
                }

            }
        }
    }
    fs.writeFileSync(`${docsDir}/_toc.yaml`, content);

    done();
}

const docs = gulp.series(generateApiJson, removeRenames, generateDocs, gulp.parallel(prependBook, createToc));

module.exports = {docs};
