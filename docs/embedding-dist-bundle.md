# Embedding wsdl-web with the Prebuilt Dist Bundle

The dist bundle lets you embed wsdl-web into any HTML page without a build step or Node.js toolchain. Include a script tag, a stylesheet, and call `WsdlWeb.init()`.

## Quick Start

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WSDL Web</title>
    <link rel="stylesheet" href="wsdl-web.css" />
    <script src="wsdl-web.js"></script>
  </head>
  <body>
    <div id="wsdl-web"></div>
    <script>
      WsdlWeb.init(document.getElementById('wsdl-web'), {
        url: 'https://example.com/my-service?wsdl',
      })
    </script>
  </body>
</html>
```

## Getting the Bundle

### From GitHub Releases

Download `wsdl-web-standalone.zip` from the [Releases](https://github.com/wsdl-web/wsdl-web/releases) page. It contains:

- `wsdl-web.js` — the JavaScript bundle (includes React)
- `wsdl-web.css` — the stylesheet
- `index.html` — an example page with commented configuration

### Build from Source

```bash
git clone https://github.com/wsdl-web/wsdl-web.git
cd wsdl-web
npm install
npm run build:standalone
```

The output is written to the `dist-standalone/` directory.

## API

### `WsdlWeb.init(domNode, config?)`

Mounts the wsdl-web explorer into the given DOM element.

| Parameter | Type          | Description                          |
| --------- | ------------- | ------------------------------------ |
| `domNode` | `HTMLElement` | The container element to render into |
| `config`  | `object`      | Optional configuration (see below)   |

## Configuration Options

| Option              | Type                              | Default | Description                                                       |
| ------------------- | --------------------------------- | ------- | ----------------------------------------------------------------- |
| `url`               | `string`                          | `''`    | WSDL URL to load automatically on startup                         |
| `urls`              | `Array<string \| {label, url}>`   | `[]`    | Multiple WSDLs for the spec switcher dropdown (see below)         |
| `showUrlInput`      | `boolean`                         | `true`  | Show the URL text input in the top bar                            |
| `showExploreButton` | `boolean`                         | `true`  | Show the "Explore" button                                         |
| `showBrowseButton`  | `boolean`                         | `true`  | Show the "Browse" button for loading local WSDL files             |
| `baseUrlOverride`   | `string`                          | `''`    | Override the base URL for all SOAP endpoint addresses             |

## Examples

### Pre-configured WSDL with no user controls

Lock the explorer to a specific WSDL and hide all input controls:

```html
<script>
  WsdlWeb.init(document.getElementById('wsdl-web'), {
    url: 'https://example.com/service?wsdl',
    showUrlInput: false,
    showExploreButton: false,
    showBrowseButton: false,
  })
</script>
```

### Multiple WSDLs with spec switcher

Load several WSDLs and let users switch between them from a dropdown:

```html
<script>
  WsdlWeb.init(document.getElementById('wsdl-web'), {
    urls: [
      { label: 'Users API', url: 'https://example.com/users?wsdl' },
      { label: 'Orders API', url: 'https://example.com/orders?wsdl' },
      { label: 'Inventory', url: 'https://example.com/inventory?wsdl' },
    ],
  })
</script>
```

You can also pass plain URL strings — labels are derived automatically from the hostname and path:

```html
<script>
  WsdlWeb.init(document.getElementById('wsdl-web'), {
    urls: [
      'https://example.com/users?wsdl',
      'https://example.com/orders?wsdl',
    ],
  })
</script>
```

### Route requests through a proxy

```html
<script>
  WsdlWeb.init(document.getElementById('wsdl-web'), {
    url: 'https://example.com/service?wsdl',
    baseUrlOverride: 'http://localhost:8080',
  })
</script>
```

### Full explorer (default)

```html
<script>
  WsdlWeb.init(document.getElementById('wsdl-web'))
</script>
```
