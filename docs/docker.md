# Docker

WSDL Web is available as a Docker image, serving the app via Nginx on port 80.

## Quick start

```sh
docker run -p 8080:80 outofcoffee/wsdl-web
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## Available tags

Images are published to Docker Hub as `outofcoffee/wsdl-web`:

| Tag | Description |
|-----|-------------|
| `0.6.4` | Specific version |
| `0.6` | Latest patch for a minor version |

## Building the image locally

```sh
git clone https://github.com/wsdl-web/wsdl-web.git
cd wsdl-web
docker build -t wsdl-web .
docker run -p 8080:80 wsdl-web
```

## Custom Nginx configuration

The image uses the default Nginx configuration. To customise it, mount your own config:

```sh
docker run -p 8080:80 \
  -v /path/to/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  outofcoffee/wsdl-web
```
