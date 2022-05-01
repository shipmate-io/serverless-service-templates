#!/usr/bin/env sh
set -e

# Wait until PHP-FPM is up and accepts connections. Fail if not started in 10 secs.
for run in $(seq 20)
do
  if [[ "$run" -gt "1" ]]; then
    echo "Retrying..."
  fi
  
  response=$(
    SCRIPT_NAME=/fpm-status SCRIPT_FILENAME=/fpm-status REQUEST_METHOD=GET cgi-fcgi -bind -connect 127.0.0.1:9000 || true
  )

  if [[ "$response" == *"pool"* ]]; then
    echo "FPM is running and ready. Starting nginx."
    /usr/sbin/nginx -c /etc/nginx/nginx.conf
    exit 0
  else
    echo "$response"
  fi

  sleep .5
done

echo "FPM has failed to start on-time, exiting."
exit 1