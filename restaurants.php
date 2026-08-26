<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

// រ៉ាប់រងការភ្ជាប់ទៅ Database (កែប្រែ path តាម folder ជាក់ស្តែងរបស់អ្នក)
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // ប្រសិនបើមានផ្ញើ id មក នោះទាញយកព័ត៌មានលម្អិតហាងមួយ
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
        $query = "SELECT * FROM restaurants WHERE id = :id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $restaurant = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($restaurant) {
            // ទាញយក Menu Item របស់ហាងនោះមកជាមួយ
            $menu_query = "SELECT * FROM menu_items WHERE restaurant_id = :id";
            $menu_stmt = $db->prepare($menu_query);
            $menu_stmt->bindParam(':id', $id);
            $menu_stmt->execute();
            $restaurant['menu'] = $menu_stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $restaurant]);
        } else {
            echo json_encode(["status" => "error", "message" => "រកមិនឃើញហាងអាហារនេះទេ"]);
        }
    } else {
        // បើគ្មាន id ទេ ទាញយកបញ្ជីហាងទាំងអស់
        $query = "SELECT * FROM restaurants";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $restaurants = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["status" => "success", "data" => $restaurants]);
    }
}
?>