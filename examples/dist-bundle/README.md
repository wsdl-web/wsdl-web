# Dist Bundle Example

This example shows how to embed wsdl-web in a plain HTML page using the prebuilt dist bundle.

## Setup

1. Build the standalone bundle (or download it from a [GitHub release](https://github.com/wsdl-web/wsdl-web/releases)):

   ```bash
   # From the repository root
   npm install
   npm run build:standalone
   ```

2. Copy the build output into this directory:

   ```bash
   cp dist-standalone/wsdl-web.js examples/dist-bundle/
   cp dist-standalone/wsdl-web.css examples/dist-bundle/
   ```

3. Open `index.html` in your browser — or serve it with any static file server:

   ```bash
   npx serve examples/dist-bundle
   ```

## What It Does

The example mounts wsdl-web with a pre-configured WSDL URL and hides the URL input, Explore button, and Browse button so users see only the WSDL explorer.

## Documentation

See the full documentation: [Embedding with the Dist Bundle](../../docs/embedding-dist-bundle.md)
