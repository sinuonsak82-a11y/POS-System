<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$data = json_decode(file_get_contents("php://input"), true);
$currentPassword = $data['currentPassword'] ?? '';
$newPassword = $data['newPassword'] ?? '';

if (strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "New password must be at least 6 characters"]);
    exit;
}

$sql = "SELECT PasswordHash FROM Users WHERE UserID = ?";
$stmt = sqlsrv_query($conn, $sql, [$_SESSION['user_id']]);
$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$user || !password_verify($currentPassword, $user['PasswordHash'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Current password is incorrect"]);
    exit;
}

$newHash = password_hash($newPassword, PASSWORD_BCRYPT);
$update = "UPDATE Users SET PasswordHash = ?, UpdatedAt = GETDATE() WHERE UserID = ?";
sqlsrv_query($conn, $update, [$newHash, $_SESSION['user_id']]);

logActivity($conn, $_SESSION['user_id'], "Changed password");

echo json_encode(["success" => true, "message" => "Password updated"]);
