#!/bin/bash

mode="${CONTAINER_MODE:-web}";

if [ $mode = 'web' ]; then
    sed -i 's|include /etc/nginx/conf\.d/\*\.conf;|include /etc/nginx/conf.d/web.conf;|' /etc/nginx/nginx.conf
else
    sed -i 's|include /etc/nginx/conf\.d/\*\.conf;|include /etc/nginx/conf.d/cli.conf;|' /etc/nginx/nginx.conf
fi