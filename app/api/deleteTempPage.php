<?php

session_start();
if($_SESSION['auth']!=true){
    header("HTTP/1.0 403 Forbidden");
    die;
}

$file = '../../123o7y3o48ilh.html';

if (file_exists($file)) {
    unlink($file);
}else{
    header('HTTP/1.1 400 Bad Request');
}