<?php
// ដាក់កូដ CORS នៅទីនេះផ្ទាល់តែម្ដង ដើម្បីធានាថាវាដំណើរការមុនគេ
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// បន្ទាប់មកค่อย require ឯកសារផ្សេងៗដូចធម្មតា
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../helpers/auth_check.php";

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Username and password are required"]);
    exit;
}

$sql = "SELECT u.UserID, u.Username, u.PasswordHash, u.FullName, u.Status, r.RoleName
        FROM Users u JOIN Roles r ON u.RoleID = r.RoleID
        WHERE u.Username = ?";
$stmt = sqlsrv_query($conn, $sql, [$username]);
$user = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);

if (!$user || !password_verify($password, $user['PasswordHash'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid username or password"]);
    exit;
}

if ($user['Status'] !== 'Active') {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Account is disabled"]);
    exit;
}

$_SESSION['user_id'] = $user['UserID'];
$_SESSION['username'] = $user['Username'];
$_SESSION['role'] = $user['RoleName'];

logActivity($conn, $user['UserID'], "Logged in");

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user['UserID'],
        "username" => $user['Username'],
        "fullName" => $user['FullName'],
        "role" => $user['RoleName']
    ]
]);
