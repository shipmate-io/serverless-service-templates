FROM node:{{ variable.node_version }} as build-stage

# Set the environment variables, if any.
{% for name, value in environment %}
ARG {{ name }}
{% endfor %}

# Install the additional Linux packages or utilites, if specified.
{% if variable.additional_software_script|length > 0 %}
RUN apt-get update \
{% for command in variable.additional_software_script|split('\n')|filter(command => command) %}
 && ({{ command }}) \
{% endfor %}
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
{% endif %}

# Create the directory to copy the source code to.
RUN mkdir -p {{ path('/app/', variable.path_to_source_code) }}

# CD into the directory.
WORKDIR {{ path('/app/', variable.path_to_source_code) }}

# Copy the npmrc configuration into the image to authenticate with private NPM registries.
{% if variable.private_npm_registries %}
COPY static/.npmrc {{ path('/app/', variable.path_to_source_code, '/') }}
{% endif %}

# Copy the locked dependency manifest into the directory and install the dependencies using the specified package manager.
{% if variable.package_manager == 'npm' %}
COPY {{ path('code-repository/', variable.path_to_source_code, '/package*.json') }} {{ path('/app/', variable.path_to_source_code, '/') }}
RUN npm install
{% elseif variable.package_manager == 'yarn' %}
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
{% for command in variable.build_script|trim|split('\n') %}
RUN {{ command }}
{% endfor %}

# Switch to the NGINX image.
FROM europe-west3-docker.pkg.dev/smoothy-171414/base-images/nginx/1.21:1.0.0

# Copy the nginx configuration into the image.
COPY static/server.conf /etc/nginx/conf.d/server.conf

# Copy the source code of the service into the image.
COPY --from=build-stage {{ path('/app/', variable.path_to_source_code, variable.path_to_build) }} /usr/share/nginx/html
