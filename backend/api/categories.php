<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT * FROM Categories ORDER BY CategoryName";
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
    $sql = "INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)";
    sqlsrv_query($conn, $sql, [$data['categoryName'], $data['description'] ?? '']);
    echo json_encode(["success" => true, "message" => "Category created"]);
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE Categories SET CategoryName = ?, Description = ? WHERE CategoryID = ?";
    sqlsrv_query($conn, $sql, [$data['categoryName'], $data['description'] ?? '', $data['categoryId']]);
    echo json_encode(["success" => true, "message" => "Category updated"]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $sql = "DELETE FROM Categories WHERE CategoryID = ?";
    sqlsrv_query($conn, $sql, [$id]);
    echo json_encode(["success" => true, "message" => "Category deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
