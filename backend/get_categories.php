<?php
// Set headers for CORS and JSON response
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database configuration
$host = 'localhost';
$db   = 'wedding_marketplace';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    // Fetch all categories
    $stmt = $pdo->query("SELECT id, name, image_url FROM categories");
    $categories = $stmt->fetchAll();
    
    // Return success response with data
    echo json_encode([
        'success' => true, 
        'categories' => $categories
    ]);

} catch (PDOException $e) {
    // Return error response if DB fails
    echo json_encode([
        'success' => false, 
        'error' => 'Database connection or query failed'
    ]);
}
?>