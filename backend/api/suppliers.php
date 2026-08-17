<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM Suppliers ORDER BY SupplierName";
    $stmt = sqlsrv_query($conn, $sql);
    $rows = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $rows[] = $row;
    }
    echo json_encode(["success" => true, "data" => $rows]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO Suppliers (SupplierName, ContactPerson, Phone, Email, Address) VALUES (?, ?, ?, ?, ?)";
    sqlsrv_query($conn, $sql, [
        $data['supplierName'], $data['contactPerson'] ?? '', $data['phone'] ?? '',
        $data['email'] ?? '', $data['address'] ?? ''
    ]);
    echo json_encode(["success" => true, "message" => "Supplier created"]);
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE Suppliers SET SupplierName = ?, ContactPerson = ?, Phone = ?, Email = ?, Address = ? WHERE SupplierID = ?";
    sqlsrv_query($conn, $sql, [
        $data['supplierName'], $data['contactPerson'] ?? '', $data['phone'] ?? '',
        $data['email'] ?? '', $data['address'] ?? '', $data['supplierId']
    ]);
    echo json_encode(["success" => true, "message" => "Supplier updated"]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    sqlsrv_query($conn, "DELETE FROM Suppliers WHERE SupplierID = ?", [$id]);
    echo json_encode(["success" => true, "message" => "Supplier deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
