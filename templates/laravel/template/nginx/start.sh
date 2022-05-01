#!/usr/bin/env sh
set -e

# Wait until PHP-FPM is up and accepts connections. Fail if not started in 10 secs.
for run in $(seq 20)
do
  if [[ "$run" -gt "1" ]]; then
    echo "Retrying..."
  fi

  if [[ ! -z "$(netstat -an | grep :9000)" ]]; then
    echo "FPM is running and ready. Starting nginx."
    /usr/sbin/nginx -c /etc/nginx/nginx.conf
    exit 0
  fi

  sleep .5
done

echo "FPM has failed to start on-time, exiting."
exit 1