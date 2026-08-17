<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT sm.*, p.ProductName, u.FullName AS PerformedBy
            FROM StockMovements sm
            JOIN Products p ON sm.ProductID = p.ProductID
            JOIN Users u ON sm.UserID = u.UserID
            ORDER BY sm.CreatedAt DESC";
    $stmt = sqlsrv_query($conn, $sql);
    $rows = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $rows[] = $row;
    }
    echo json_encode(["success" => true, "data" => $rows]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$productId = $data['productId'] ?? null;
$type = $data['type'] ?? '';
$quantity = (int)($data['quantity'] ?? 0);
$reason = $data['reason'] ?? '';
$transferTo = $data['transferTo'] ?? null;

if (!$productId || $quantity <= 0 || !in_array($type, ['In', 'Out', 'Transfer', 'Adjustment'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid stock movement data"]);
    exit;
}

$stmt = sqlsrv_query($conn, "SELECT QuantityOnHand FROM Products WHERE ProductID = ?", [$productId]);
$product = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$product) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Product not found"]);
    exit;
}

$delta = in_array($type, ['Out', 'Transfer']) ? -$quantity : $quantity;
$newQty = $product['QuantityOnHand'] + $delta;

if ($newQty < 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Insufficient stock on hand"]);
    exit;
}

sqlsrv_query($conn, "UPDATE Products SET QuantityOnHand = ?, UpdatedAt = GETDATE() WHERE ProductID = ?", [$newQty, $productId]);

$sql = "INSERT INTO StockMovements (ProductID, MovementType, Quantity, Reason, TransferToLocation, UserID)
        VALUES (?, ?, ?, ?, ?, ?)";
sqlsrv_query($conn, $sql, [$productId, $type, $quantity, $reason, $transferTo, $_SESSION['user_id']]);

logActivity($conn, $_SESSION['user_id'], "$type stock: product #$productId, qty $quantity");

echo json_encode(["success" => true, "message" => "Stock movement recorded", "newQuantity" => $newQty]);
