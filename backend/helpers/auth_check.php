<?php
function requireLogin() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
}

function requireRole($allowedRoles) {
    requireLogin();
    if (!in_array($_SESSION['role'], $allowedRoles)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Forbidden"]);
        exit;
    }
}

function logActivity($conn, $userId, $action) {
    $sql = "INSERT INTO ActivityLog (UserID, Action) VALUES (?, ?)";
    sqlsrv_query($conn, $sql, [$userId, $action]);
}
