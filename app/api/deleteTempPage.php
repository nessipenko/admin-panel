<?php
$file = '../../123o7y3o48ilh.html';

if (file_exists($file)) {
    unlink($file);
}else{
    header('HTTP/1.1 400 Bad Request');
}