:80 {
  header X-Robots-Tag "noindex, nofollow"
  header Cache-Control "no-store"
  header Content-Security-Policy "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; frame-src 'none'"
  handle_path /api/* {
    reverse_proxy server:80
  }
  handle_path /images/* {
    reverse_proxy recovery-image-source:80
  }
  handle {
    root * /srv
    try_files {path} /index.html
    file_server
    encode gzip
  }
}
