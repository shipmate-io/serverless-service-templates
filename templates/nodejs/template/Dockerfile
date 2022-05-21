FROM europe-west3-docker.pkg.dev/smoothy-171414/base-images/nodejs/{{ variable.node_version }}:1.0.1

# Install the additional Linux packages or utilites, if specified.
{% if variable.additional_software_script|length > 0 %}
RUN echo "" \
{% for command in variable.additional_software_script|split('\n')|filter(command => command) %}
 && ({{ command }}) \
{% endfor %}
 && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*
{% endif %}

# Create the directory to copy the source code to.
RUN mkdir -p {{ path('/var/www/html/', variable.path_to_source_code) }}

# CD into the directory.
WORKDIR {{ path('/var/www/html/', variable.path_to_source_code) }}

# Set the environment variables, if any.
{% for name, value in environment %}
ARG {{ name }}
{% endfor %}

# Copy the npmrc configuration into the image to authenticate with private NPM registries.
{% if variable.private_npm_registries %}
COPY .npmrc {{ path('/var/www/html/', variable.path_to_source_code, '/') }}
{% endif %}

# Copy the locked dependency manifest into the directory and install the dependencies using the specified package manager.
{% if variable.package_manager == 'npm' %}
COPY {{ path('code-repository/', variable.path_to_source_code, '/package*.json') }} {{ path('/var/www/html/', variable.path_to_source_code, '/') }}
RUN npm install
{% elseif variable.package_manager == 'yarn' %}
COPY {{ path('code-repository/', variable.path_to_source_code, '/package*.json') }} {{ path('code-repository/', variable.path_to_source_code, '/yarn.*') }} {{ path('/var/www/html/', variable.path_to_source_code, '/') }}
RUN yarn install
{% endif %}

# Copy the source code of the service into the directory.
COPY {{ path('code-repository/', variable.path_to_source_code, '/') }} {{ path('/var/www/html/', variable.path_to_source_code, '/') }}

# Copy the source code of the shared libraries into the directory.
{% for path_to_shared_library in variable.paths_to_shared_libraries %}
COPY {{ path('code-repository/', path_to_shared_library, '/') }}  {{ path('/var/www/html/', path_to_shared_library, '/') }}
{% endfor %}

# Run the specified build script.
{% if variable.build_script|trim %}
{% for command in variable.build_script|trim|split('\n') %}
RUN {{ command }}
{% endfor %}
{% endif %}

CMD ["node", "{{ path('/var/www/html/', variable.path_to_server) }}"]