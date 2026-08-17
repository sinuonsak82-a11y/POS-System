<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$_SESSION = [];
session_destroy();

echo json_encode(["success" => true, "message" => "Logged out"]);
