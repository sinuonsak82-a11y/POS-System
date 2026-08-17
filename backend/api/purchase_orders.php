<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    $sql = "SELECT po.*, s.SupplierName, u.FullName AS CreatedBy
            FROM PurchaseOrders po
            JOIN Suppliers s ON po.SupplierID = s.SupplierID
            JOIN Users u ON po.UserID = u.UserID
            ORDER BY po.OrderDate DESC";
    $stmt = sqlsrv_query($conn, $sql);
    $orders = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $itemStmt = sqlsrv_query($conn, "SELECT poi.*, p.ProductName FROM PurchaseOrderItems poi
            JOIN Products p ON poi.ProductID = p.ProductID WHERE POID = ?", [$row['POID']]);
        $items = [];
        while ($item = sqlsrv_fetch_array($itemStmt, SQLSRV_FETCH_ASSOC)) {
            $items[] = $item;
        }
        $row['items'] = $items;
        $orders[] = $row;
    }
    echo json_encode(["success" => true, "data" => $orders]);
    exit;
}

if ($method === 'POST' && $action === 'receive') {
    $data = json_decode(file_get_contents("php://input"), true);
    $poId = $data['poId'];
    $itemStmt = sqlsrv_query($conn, "SELECT * FROM PurchaseOrderItems WHERE POID = ?", [$poId]);
    while ($item = sqlsrv_fetch_array($itemStmt, SQLSRV_FETCH_ASSOC)) {
        sqlsrv_query($conn, "UPDATE Products SET QuantityOnHand = QuantityOnHand + ? WHERE ProductID = ?",
            [$item['Quantity'], $item['ProductID']]);
        sqlsrv_query($conn, "UPDATE PurchaseOrderItems SET ReceivedQuantity = ? WHERE POItemID = ?",
            [$item['Quantity'], $item['POItemID']]);
        sqlsrv_query($conn, "INSERT INTO StockMovements (ProductID, MovementType, Quantity, Reason, UserID) VALUES (?, 'In', ?, ?, ?)",
            [$item['ProductID'], $item['Quantity'], "Received PO #$poId", $_SESSION['user_id']]);
    }
    sqlsrv_query($conn, "UPDATE PurchaseOrders SET Status = 'Received', ReceivedDate = GETDATE() WHERE POID = ?", [$poId]);
    echo json_encode(["success" => true, "message" => "Purchase order received, stock updated"]);
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "INSERT INTO PurchaseOrders (SupplierID, UserID, Notes) OUTPUT INSERTED.POID VALUES (?, ?, ?)";
    $stmt = sqlsrv_query($conn, $sql, [$data['supplierId'], $_SESSION['user_id'], $data['notes'] ?? '']);
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_NUMERIC);
    $poId = $row[0];

    foreach ($data['items'] as $item) {
        sqlsrv_query($conn, "INSERT INTO PurchaseOrderItems (POID, ProductID, Quantity, UnitCost) VALUES (?, ?, ?, ?)",
            [$poId, $item['productId'], $item['quantity'], $item['unitCost']]);
    }

    echo json_encode(["success" => true, "message" => "Purchase order created", "poId" => $poId]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
