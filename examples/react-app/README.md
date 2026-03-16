# React App Example

This example shows how to use wsdl-web as an npm dependency in a React application.

## Setup

1. Build the library from the repository root:

   ```bash
   npm install
   npm run build:lib
   ```

2. Install dependencies for this example:

   ```bash
   cd examples/react-app
   npm install
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

## What It Does

The example imports the `<WsdlWeb />` component and its stylesheet, then renders it with a pre-configured WSDL URL. The full explorer UI is shown (URL input, Explore, and Browse are all visible by default).

## Documentation

See the full documentation: [Embedding as an npm Package](../../docs/embedding-npm-package.md)
