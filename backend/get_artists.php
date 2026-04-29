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
    
    // Get the category ID from the URL parameter
    $category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

    if ($category_id > 0) {
        // Fetch artists and get one image from their portfolio as a thumbnail
        $stmt = $pdo->prepare("
            SELECT a.id, a.name, a.rating, 
                   (SELECT image_url FROM portfolio p WHERE p.artist_id = a.id LIMIT 1) as thumbnail 
            FROM artists a 
            WHERE a.category_id = ? 
            ORDER BY a.rating DESC
        ");
        
        $stmt->execute([$category_id]);
        $artists = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'artists' => $artists]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid category selected']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database query failed']);
}
?>