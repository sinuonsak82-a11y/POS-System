<?php
require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

requireLogin();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    $sql = "SELECT p.*, c.CategoryName FROM Products p
            JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE p.ProductName LIKE ? OR p.Barcode LIKE ?
            ORDER BY p.ProductName";
    $like = "%$search%";
    $stmt = sqlsrv_query($conn, $sql, [$like, $like]);
    $rows = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $rows[] = $row;
    }
    echo json_encode(["success" => true, "data" => $rows]);
    exit;
}

if ($method === 'POST') {
    $productName = $_POST['productName'] ?? '';
    $categoryId = $_POST['categoryId'] ?? '';
    $barcode = $_POST['barcode'] ?? '';
    $costPrice = $_POST['costPrice'] ?? 0;
    $sellingPrice = $_POST['sellingPrice'] ?? 0;
    $status = $_POST['status'] ?? 'Active';
    $imagePath = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = uniqid('prod_') . '.' . $ext;
        $target = __DIR__ . "/../uploads/" . $filename;
        move_uploaded_file($_FILES['image']['tmp_name'], $target);
        $imagePath = "uploads/" . $filename;
    }

    $sql = "INSERT INTO Products (ProductName, CategoryID, Barcode, CostPrice, SellingPrice, ImagePath, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    sqlsrv_query($conn, $sql, [$productName, $categoryId, $barcode, $costPrice, $sellingPrice, $imagePath, $status]);
    logActivity($conn, $_SESSION['user_id'], "Created product: $productName");
    echo json_encode(["success" => true, "message" => "Product created"]);
    exit;
}

if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    $sql = "UPDATE Products SET ProductName = ?, CategoryID = ?, Barcode = ?, CostPrice = ?, SellingPrice = ?, Status = ?, UpdatedAt = GETDATE()
            WHERE ProductID = ?";
    sqlsrv_query($conn, $sql, [
        $data['productName'], $data['categoryId'], $data['barcode'],
        $data['costPrice'], $data['sellingPrice'], $data['status'], $data['productId']
    ]);
    echo json_encode(["success" => true, "message" => "Product updated"]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $sql = "DELETE FROM Products WHERE ProductID = ?";
    sqlsrv_query($conn, $sql, [$id]);
    echo json_encode(["success" => true, "message" => "Product deleted"]);
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
