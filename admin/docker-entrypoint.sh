#!/bin/sh
set -e

PORT="${PORT:-80}"

rm -f /etc/nginx/conf.d/default.conf

cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

echo "nginx listening on port ${PORT}"
exec nginx -g 'daemon off;'
