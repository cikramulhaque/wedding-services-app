<?php
// Ensure cookies can be sent back and forth between React and PHP
header("Access-Control-Allow-Origin: http://localhost:3000"); // Your React app URL
header("Access-Control-Allow-Credentials: true"); // Crucial for PHP sessions
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Start the session before any output
session_start();

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
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

// Get the POST data from React
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['username']) && trim($data['username']) !== '') {
    $username = trim($data['username']);

    // Secure prepared statement to check if user exists
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $userRecord = $stmt->fetch();

    // If user does not exist, create them
    if (!$userRecord) {
        $insertStmt = $pdo->prepare("INSERT INTO users (username) VALUES (?)");
        $insertStmt->execute([$username]);
        
        $userId = $pdo->lastInsertId();
        $userRecord = ['id' => $userId, 'username' => $username];
    }

    // Store user ID in the PHP Session
    $_SESSION['user_id'] = $userRecord['id'];
    $_SESSION['username'] = $userRecord['username'];

    // Return the user data to React
    echo json_encode([
        'success' => true, 
        'user' => $userRecord,
        'message' => 'Login successful'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Username is required']);
}
?>