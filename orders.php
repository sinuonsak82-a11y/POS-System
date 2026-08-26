<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // ទទួលទិន្នន័យ JSON ដែលផ្ញើមកពី Frontend
    $data = json_decode(file_get_contents("php://input"), true);

    if (!empty($data['customer_id']) && !empty($data['restaurant_id']) && !empty($data['items'])) {
        try {
            $db->beginTransaction();

            // 1. បង្កើត Order ក្នុងតារាង orders
            $query = "INSERT INTO orders (customer_id, restaurant_id, total_amount, status, delivery_address) 
                      VALUES (:customer_id, :restaurant_id, :total_amount, 'pending', :delivery_address)";
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':customer_id' => $data['customer_id'],
                ':restaurant_id' => $data['restaurant_id'],
                ':total_amount' => $data['total_amount'],
                ':delivery_address' => $data['delivery_address']
            ]);

            $order_id = $db->lastInsertId();

            // 2. បញ្ចូលមុខទំនិញនិមួយៗទៅក្នុង order_items
            $item_query = "INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
                           VALUES (:order_id, :menu_item_id, :quantity, :price)";
            $item_stmt = $db->prepare($item_query);

            foreach ($data['items'] as $item) {
                $item_stmt->execute([
                    ':order_id' => $order_id,
                    ':menu_item_id' => $item['menu_item_id'],
                    ':quantity' => $item['quantity'],
                    ':price' => $item['price']
                ]);
            }

            $db->commit();
            echo json_encode(["status" => "success", "message" => "ការកុម្មង់ជោគជ័យ", "order_id" => $order_id]);
        } catch (Exception $e) {
            $db->rollBack();
            echo json_encode(["status" => "error", "message" => "មានបញ្ហាក្នុងការបង្កើត order: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "ទិន្នន័យមិនគ្រប់គ្រាន់"]);
    }
}
?>
