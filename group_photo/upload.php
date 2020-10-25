<?php
 header("Access-Control-Allow-Origin: *");
 //header('Access-Control-Allow-Origin: http://localhost:5501/')
 

$fileName = "./images/" . $_POST['filename'];
$img = $_POST['imgBase64'];
$img = str_replace('data:image/png;base64,', '', $img);
$img = str_replace(' ', '+', $img);
$fileData = base64_decode($img);
file_put_contents($fileName , $fileData);
echo $fileName;
?>
