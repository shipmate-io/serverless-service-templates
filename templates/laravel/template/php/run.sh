#!/bin/sh

{% for command in variable.deploy_script|trim|split('\n') %}
{{ command }}
{% endfor %}