#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

async function buildBookmarklet() {
    const sourceFile = path.join(__dirname, 'trailforks-export.js');
    const outputFile = path.join(__dirname, 'trailforks-export.bookmarklet');

    if (!fs.existsSync(sourceFile)) {
        console.error('Source file trailforks-export.js not found');
        process.exit(1);
    }

    try {
        const sourceCode = fs.readFileSync(sourceFile, 'utf8');
        
        // Minify with Terser
        const result = await minify(sourceCode, {
            compress: {
                dead_code: true,
                drop_console: false,
                drop_debugger: true,
                keep_fnames: false,
                keep_fargs: false,
            },
            mangle: {
                toplevel: true,
            },
            output: {
                comments: false,
            },
        });

        if (result.error) {
            throw result.error;
        }

        // Convert to bookmarklet format
        const bookmarklet = 'javascript:' + encodeURIComponent(result.code) + '+void+0';
        
        fs.writeFileSync(outputFile, bookmarklet);
        console.log('✅ Bookmarklet generated successfully!');
        console.log(`📝 Output written to: ${path.basename(outputFile)}`);
        
    } catch (error) {
        console.error('❌ Error generating bookmarklet:', error.message);
        process.exit(1);
    }
}

buildBookmarklet();