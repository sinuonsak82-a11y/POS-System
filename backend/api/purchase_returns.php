<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $sql = "SELECT pr.*, p.ProductName, u.FullName AS PerformedBy
            FROM PurchaseReturns pr
            JOIN Products p ON pr.ProductID = p.ProductID
            JOIN Users u ON pr.UserID = u.UserID
            ORDER BY pr.CreatedAt DESC";
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
    $poId = $data['poId'];
    $productId = $data['productId'];
    $quantity = (int)$data['quantity'];
    $reason = $data['reason'] ?? '';

    sqlsrv_query($conn, "UPDATE Products SET QuantityOnHand = QuantityOnHand - ? WHERE ProductID = ?", [$quantity, $productId]);
    sqlsrv_query($conn, "INSERT INTO PurchaseReturns (POID, ProductID, Quantity, Reason, UserID) VALUES (?, ?, ?, ?, ?)",
        [$poId, $productId, $quantity, $reason, $_SESSION['user_id']]);
    sqlsrv_query($conn, "INSERT INTO StockMovements (ProductID, MovementType, Quantity, Reason, UserID) VALUES (?, 'Out', ?, ?, ?)",
        [$productId, $quantity, "Purchase return: $reason", $_SESSION['user_id']]);

    echo json_encode(["success" => true, "message" => "Purchase return recorded"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
