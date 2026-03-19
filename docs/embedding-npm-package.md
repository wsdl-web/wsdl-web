# Embedding wsdl-web as an npm Package

The npm package lets you include wsdl-web as a React component in your own application. This is ideal when you already have a React project and want to integrate WSDL exploration directly.

## Installation

```bash
npm install wsdl-web
```

## Quick Start

```tsx
import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

function App() {
  return <WsdlWeb url="https://example.com/my-service?wsdl" />
}

export default App
```

## API

### `<WsdlWeb />` Component

The `WsdlWeb` component renders the full WSDL explorer. All props are optional.

```tsx
import { WsdlWeb } from 'wsdl-web'
import type { WsdlWebConfig } from 'wsdl-web'
```

### Props

| Prop                | Type                              | Default | Description                                                       |
| ------------------- | --------------------------------- | ------- | ----------------------------------------------------------------- |
| `url`               | `string`                          | `''`    | WSDL URL to load automatically on startup                         |
| `urls`              | `Array<string \| {label, url}>`   | `[]`    | Multiple WSDLs for the spec switcher dropdown (see below)         |
| `showUrlInput`      | `boolean`                         | `true`  | Show the URL text input in the top bar                            |
| `showExploreButton` | `boolean`                         | `true`  | Show the "Explore" button                                         |
| `showBrowseButton`  | `boolean`                         | `true`  | Show the "Browse" button for loading local WSDL files             |
| `baseUrlOverride`   | `string`                          | `''`    | Override the base URL for all SOAP endpoint addresses             |

## Examples

### Pre-configured WSDL with no user controls

```tsx
import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

function WsdlViewer() {
  return (
    <WsdlWeb
      url="https://example.com/service?wsdl"
      showUrlInput={false}
      showExploreButton={false}
      showBrowseButton={false}
    />
  )
}
```

### Multiple WSDLs with spec switcher

```tsx
import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

function App() {
  return (
    <WsdlWeb
      urls={[
        { label: 'Users API', url: 'https://example.com/users?wsdl' },
        { label: 'Orders API', url: 'https://example.com/orders?wsdl' },
        { label: 'Inventory', url: 'https://example.com/inventory?wsdl' },
      ]}
    />
  )
}
```

Plain URL strings also work — labels are derived automatically:

```tsx
<WsdlWeb
  urls={[
    'https://example.com/users?wsdl',
    'https://example.com/orders?wsdl',
  ]}
/>
```

### Dynamic URL from state

```tsx
import { useState } from 'react'
import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

function App() {
  const [wsdlUrl, setWsdlUrl] = useState('')

  return (
    <div>
      <input
        value={wsdlUrl}
        onChange={(e) => setWsdlUrl(e.target.value)}
        placeholder="Enter WSDL URL"
      />
      <WsdlWeb url={wsdlUrl} />
    </div>
  )
}
```

### Route requests through a proxy

```tsx
<WsdlWeb
  url="https://example.com/service?wsdl"
  baseUrlOverride="http://localhost:8080"
/>
```

### Full explorer (default)

```tsx
import { WsdlWeb } from 'wsdl-web'
import 'wsdl-web/style.css'

function App() {
  return <WsdlWeb />
}
```

## Stylesheet

You must import the stylesheet for wsdl-web to render correctly:

```tsx
import 'wsdl-web/style.css'
```

This imports the Tailwind CSS styles and custom theme variables used by the component. If you use your own Tailwind setup, you may need to adjust for specificity conflicts.

## Peer Dependencies

The npm package expects `react` and `react-dom` (v18 or v19) as peer dependencies. These are not bundled — your application provides them.

## TypeScript

The package ships with type declarations. The `WsdlWebConfig` type is exported for use in your own code:

```tsx
import type { WsdlWebConfig } from 'wsdl-web'

const config: WsdlWebConfig = {
  url: 'https://example.com/service?wsdl',
  showBrowseButton: false,
}
```
