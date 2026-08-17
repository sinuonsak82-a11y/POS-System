<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$stats = [];

$stmt = sqlsrv_query($conn, "SELECT COUNT(*) AS total FROM Products");
$stats['totalProducts'] = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)['total'];

$stmt = sqlsrv_query($conn, "SELECT COUNT(*) AS total FROM Categories");
$stats['totalCategories'] = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)['total'];

$stmt = sqlsrv_query($conn, "SELECT COUNT(*) AS total FROM Users WHERE Status = 'Active'");
$stats['activeEmployees'] = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)['total'];

$stmt = sqlsrv_query($conn, "SELECT COUNT(*) AS total FROM Products WHERE Status = 'Inactive'");
$stats['inactiveProducts'] = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)['total'];

echo json_encode(["success" => true, "data" => $stats]);
