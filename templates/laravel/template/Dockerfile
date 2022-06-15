# Set the nginx-php-fpm base image, based on the specified php version.
{% if variables.php_version == "8.0" %}
FROM europe-west3-docker.pkg.dev/smoothy-171414/base-images/nginx-php-fpm/8.0:1.0.6 AS php-stage
{% endif %}

# Install the additional Linux packages or utilites, if specified.
{% if variables.additional_software_script|length > 0 %}
RUN echo "" \
{% for command in variables.additional_software_script|split('\n')|filter(command => command) %}
 && ({{ command }}) \
{% endfor %}
 && echo ""
{% endif %}

# Build the JavaScript and CSS assets, if specified.
{% if variables.build_assets %}
FROM node:{{ variables.node_version }}-alpine AS assets-stage

# Create the directory to copy to Laravel source code to.
RUN mkdir -p {{ path('/app/', variables.path_to_source_code) }}

# CD into the directory.
WORKDIR {{ path('/app/', variables.path_to_source_code) }}

# Copy the locked JavaScript dependency manifest into the directory and install the dependencies using the specified package manager.
{% if variables.package_manager == "npm" %}
COPY {{ path('code-repository/', variables.path_to_source_code, '/package*.json') }} {{ path('/app/', variables.path_to_source_code, '/') }}
RUN npm install
{% elseif variables.package_manager == "yarn" %}
COPY {{ path('code-repository/', variables.path_to_source_code, '/package*.json') }} {{ path('code-repository/', variables.path_to_source_code, '/yarn.*') }} {{ path('/app/', variables.path_to_source_code, '/') }}
RUN yarn install
{% endif %}

# Copy the source code of the service into the directory.
COPY {{ path('code-repository/', variables.path_to_source_code, '/') }} {{ path('/app/', variables.path_to_source_code, '/') }}

# Copy the source code of the shared libraries into the directory.
{% for path_to_shared_library in variables.paths_to_shared_libraries %}
COPY {{ path('code-repository/', path_to_shared_library, '/') }}  {{ path('/app/', path_to_shared_library, '/') }}
{% endfor %}

# Run the specified build assets script.
{% for command in variables.build_assets_script|trim|split('\n') %}
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

{% if variables.release_script %}
# Copy the init.sh script into the image.
COPY php/init.sh /scripts/init.sh
# Make the scripts executable.
RUN chmod -R 775 /scripts
{% endif %}

# Copy the source code of the service into the image.
COPY {{ path('code-repository/', variables.path_to_source_code, '/') }} {{ path('/var/www', variables.path_to_source_code, '/') }}

# Copy the source code of the shared libraries into the image.
{% for path_to_shared_library in variables.paths_to_shared_libraries %}
COPY {{ path('code-repository/', path_to_shared_library, '/') }} {{ path('/var/www', path_to_shared_library, '/') }}
{% endfor %}

# Copy the cli.php file into the image.
COPY php/cli.php {{ path('/var/www', variables.path_to_source_code, 'cli.php') }}

# Make the "storage" and "bootstrap/cache" directories writable.
RUN chmod -R 775 {{ path('/var/www/', variables.path_to_source_code, '/storage') }} \
 && chmod -R 775 {{ path('/var/www/', variables.path_to_source_code, '/bootstrap/cache') }}

# Copy the built JavaScript and CSS assets into the image, if any.
{% if variables.build_assets %}
COPY --from=assets-stage {{ path('/app/', variables.path_to_source_code, '/public') }} {{ path('/var/www/', variables.path_to_source_code, '/public') }}
{% endif %}

# CD into the directory containing the source code of the service.
WORKDIR {{ path('/var/www/', variables.path_to_source_code) }}

# Authenticate against the specified private composer registries, if any.
{% for private_composer_registry in variables.private_composer_registries %}
ARG PRIVATE_COMPOSER_REGISTRY_URL_{{ loop.key }}
ARG PRIVATE_COMPOSER_REGISTRY_USERNAME_{{ loop.key }}
ARG PRIVATE_COMPOSER_REGISTRY_PASSWORD_{{ loop.key }}
RUN composer config $PRIVATE_COMPOSER_REGISTRY_URL_{{ loop.key }} $PRIVATE_COMPOSER_REGISTRY_USERNAME_{{ loop.key }} $PRIVATE_COMPOSER_REGISTRY_PASSWORD_{{ loop.key }}
{% endfor %}

# Install the composer dependencies of the service.
RUN composer install --ignore-platform-reqs --no-dev --no-interaction --prefer-dist
