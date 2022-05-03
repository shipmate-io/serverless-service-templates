#!/bin/sh

{% for command in variables.release_script|trim|split('\n') %}
{{ command }}
{% endfor %}