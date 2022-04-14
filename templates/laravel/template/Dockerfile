# Set the nginx-php-fpm base image, based on the specified php version.
{% if variable.php_version == "7.4" %}
FROM europe-west3-docker.pkg.dev/smoothy-171414/base-images/nginx-php-fpm/7.4:1.0.0 AS php-stage
{% elseif variable.php_version == "8.0" %}
FROM europe-west3-docker.pkg.dev/smoothy-171414/base-images/nginx-php-fpm/8.0:1.0.1 AS php-stage
{% endif %}

# Install the additional Linux packages or utilites, if specified.
{% if variable.additional_software_script|length > 0 %}
RUN apt-get update \
{% for command in variable.additional_software_script|split('\n')|filter(command => command) %}
 && ({{ command }}) \
{% endfor %}
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
{% endif %}

# Build the JavaScript and CSS assets, if specified.
{% if variable.build_assets %}
FROM node:{{ variable.node_version }}-alpine AS assets-stage

# Create the directory to copy to Laravel source code to.
RUN mkdir -p {{ path('/app/', variable.path_to_source_code) }}

# CD into the directory.
WORKDIR {{ path('/app/', variable.path_to_source_code) }}

# Copy the locked JavaScript dependency manifest into the directory and install the dependencies using the specified package manager.
{% if variable.package_manager == "npm" %}
COPY {{ path('code-repository/', variable.path_to_source_code, '/package*.json') }} {{ path('/app/', variable.path_to_source_code, '/') }}
RUN npm install
{% elseif variable.package_manager == "yarn" %}
COPY {{ path('code-repository/', variable.path_to_source_code, '/package*.json') }} {{ path('code-repository/', variable.path_to_source_code, '/yarn.*') }} {{ path('/app/', variable.path_to_source_code, '/') }}
RUN yarn install
{% endif %}

# Copy the source code of the service into the directory.
COPY {{ path('code-repository/', variable.path_to_source_code, '/') }} {{ path('/app/', variable.path_to_source_code, '/') }}

# Copy the source code of the shared libraries into the directory.
{% for path_to_shared_library in variable.paths_to_shared_libraries %}
COPY {{ path('code-repository/', path_to_shared_library, '/') }}  {{ path('/app/', path_to_shared_library, '/') }}
{% endfor %}

# Run the specified build assets script.
{% for command in variable.build_assets_script|trim|split('\n') %}
RUN {{ command }}
{% endfor %}
{% endif %}

# Switch to the php image.
FROM php-stage AS production-stage

# Copy the NGINX configuration files into the image.
COPY nginx/web.conf /etc/nginx/conf.d/web.conf
COPY nginx/cli.conf /etc/nginx/conf.d/cli.conf

# Copy the mode.sh entrypoint into the image.
COPY nginx/mode.sh /entrypoints/mode.sh
# Copy the run.sh entrypoint into the image.
COPY php/run.sh /entrypoints/run.sh

{% if variable.release_script %}
# Copy the init.sh script into the image.
COPY php/init.sh /scripts/init.sh
# Make the scripts executable.
RUN chmod -R 775 /scripts
{% endif %}

# Copy the source code of the service into the image.
COPY {{ path('code-repository/', variable.path_to_source_code, '/') }} {{ path('/var/www', variable.path_to_source_code, '/') }}

# Copy the source code of the shared libraries into the image.
{% for path_to_shared_library in variable.paths_to_shared_libraries %}
COPY {{ path('code-repository/', path_to_shared_library, '/') }} {{ path('/var/www', path_to_shared_library, '/') }}
{% endfor %}

# Copy the cli.php file into the image.
COPY php/cli.php {{ path('/var/www', variable.path_to_source_code, 'cli.php') }}

# Make the "storage" and "bootstrap/cache" directories writable.
RUN chmod -R 775 {{ path('/var/www/', variable.path_to_source_code, '/storage') }} \
 && chmod -R 775 {{ path('/var/www/', variable.path_to_source_code, '/bootstrap/cache') }}

# Copy the built JavaScript and CSS assets into the image, if any.
{% if variable.build_assets %}
COPY --from=assets-stage {{ path('/app/', variable.path_to_source_code, '/public') }} {{ path('/var/www/', variable.path_to_source_code, '/public') }}
{% endif %}

# CD into the directory containing the source code of the service.
WORKDIR {{ path('/var/www/', variable.path_to_source_code) }}

# Authenticate against the specified private composer registries, if any.
{% for private_composer_registry in variable.private_composer_registries %}
ARG PRIVATE_COMPOSER_REGISTRY_URL_{{ loop.key }}
ARG PRIVATE_COMPOSER_REGISTRY_USERNAME_{{ loop.key }}
ARG PRIVATE_COMPOSER_REGISTRY_PASSWORD_{{ loop.key }}
RUN composer config $PRIVATE_COMPOSER_REGISTRY_URL_{{ loop.key }} $PRIVATE_COMPOSER_REGISTRY_USERNAME_{{ loop.key }} $PRIVATE_COMPOSER_REGISTRY_PASSWORD_{{ loop.key }}
{% endfor %}

# Install the composer dependencies of the service.
RUN composer install --ignore-platform-reqs --no-dev --no-interaction --prefer-dist
