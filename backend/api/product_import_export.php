<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$action = $_GET['action'] ?? '';

if ($action === 'export') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="products.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ProductName', 'CategoryID', 'Barcode', 'CostPrice', 'SellingPrice', 'QuantityOnHand', 'ReorderLevel', 'Status']);

    $stmt = sqlsrv_query($conn, "SELECT ProductName, CategoryID, Barcode, CostPrice, SellingPrice, QuantityOnHand, ReorderLevel, Status FROM Products");
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        fputcsv($out, $row);
    }
    fclose($out);
    exit;
}

if ($action === 'import' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No file uploaded"]);
        exit;
    }

    $handle = fopen($_FILES['file']['tmp_name'], 'r');
    $header = fgetcsv($handle);
    $imported = 0;
    $errors = [];

    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) < 8) continue;
        [$name, $categoryId, $barcode, $cost, $price, $qty, $reorder, $status] = $row;
        $sql = "INSERT INTO Products (ProductName, CategoryID, Barcode, CostPrice, SellingPrice, QuantityOnHand, ReorderLevel, Status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $result = sqlsrv_query($conn, $sql, [$name, $categoryId, $barcode, $cost, $price, $qty, $reorder, $status]);
        if ($result) {
            $imported++;
        } else {
            $errors[] = "Row for '$name' failed";
        }
    }
    fclose($handle);

    echo json_encode(["success" => true, "imported" => $imported, "errors" => $errors]);
    exit;
}

http_response_code(400);
echo json_encode(["success" => false, "message" => "Invalid action"]);
