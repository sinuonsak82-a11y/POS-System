<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$lowStockOnly = isset($_GET['lowStock']) && $_GET['lowStock'] === '1';

$sql = "SELECT p.ProductID, p.ProductName, p.Barcode, p.QuantityOnHand, p.ReorderLevel, c.CategoryName
        FROM Products p JOIN Categories c ON p.CategoryID = c.CategoryID";
if ($lowStockOnly) {
    $sql .= " WHERE p.QuantityOnHand <= p.ReorderLevel";
}
$sql .= " ORDER BY p.ProductName";

$stmt = sqlsrv_query($conn, $sql);
$rows = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    $rows[] = $row;
}
echo json_encode(["success" => true, "data" => $rows]);
