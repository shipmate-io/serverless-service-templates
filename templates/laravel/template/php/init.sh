#!/bin/sh

{% for command in variable.release_script|trim|split('\n') %}
{{ command }}
{% endfor %}