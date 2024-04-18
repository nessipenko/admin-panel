<?php
$_POST = json_decode(file_get_contents('php://input'), true);
$newFile = '../../123o7y3o48ilh.html';

if ($_POST['html']) {
    file_put_contents($newFile, $_POST['html']);
}else{
    header('HTTP/1.1 400 Bad Request');
}