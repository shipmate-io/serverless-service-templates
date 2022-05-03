#!/bin/sh

{% for command in variables.deploy_script|trim|split('\n') %}
{{ command }}
{% endfor %}