<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireRole(['Admin']);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone, u.Status, r.RoleName
            FROM Users u JOIN Roles r ON u.RoleID = r.RoleID
            ORDER BY u.FullName";
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
    $hash = password_hash($data['password'], PASSWORD_BCRYPT);
    $sql = "INSERT INTO Users (Username, PasswordHash, FullName, Email, Phone, RoleID, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    sqlsrv_query($conn, $sql, [
        $data['username'], $hash, $data['fullName'], $data['email'] ?? '',
        $data['phone'] ?? '', $data['roleId'], $data['status'] ?? 'Active'
    ]);
    echo json_encode(["success" => true, "message" => "Employee created"]);
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE Users SET FullName = ?, Email = ?, Phone = ?, RoleID = ?, Status = ?, UpdatedAt = GETDATE()
            WHERE UserID = ?";
    sqlsrv_query($conn, $sql, [
        $data['fullName'], $data['email'] ?? '', $data['phone'] ?? '',
        $data['roleId'], $data['status'], $data['userId']
    ]);
    echo json_encode(["success" => true, "message" => "Employee updated"]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $sql = "DELETE FROM Users WHERE UserID = ?";
    sqlsrv_query($conn, $sql, [$id]);
    echo json_encode(["success" => true, "message" => "Employee deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
