# simple-kdom-ui

## 1. Launch Server

sudo docker run -d -p 4064:80 kdom

## 2. Launch Proxy for CORS

npm install -g local-cors-proxy

lcp --proxyUrl http://localhost:4064

## 3. Launch Front

python -m SimpleHTTPServer 3333

