<?php
$serverName = "localhost";
$connectionOptions = array(
    "Database" => "POS_DigitalPayment",
    "Uid" => "sa",
    "PWD" => "your_password",
    "CharacterSet" => "UTF-8"
);

$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}
