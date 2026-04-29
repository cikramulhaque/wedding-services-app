<?php
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
} catch (PDOException $e) {
    die(json_encode(['success' => false, 'error' => 'Database connection failed']));
}

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"), true);

switch ($action) {
    case 'get_messages':
        $user_id = $_GET['user_id'] ?? 0;
        $artist_id = $_GET['artist_id'] ?? 0;

        $stmt = $pdo->prepare("SELECT sender, message, created_at FROM messages WHERE user_id = ? AND artist_id = ? ORDER BY created_at ASC");
        $stmt->execute([$user_id, $artist_id]);
        
        echo json_encode(['success' => true, 'messages' => $stmt->fetchAll()]);
        break;

    case 'send_message':
        $user_id = $data['user_id'] ?? 0;
        $artist_id = $data['artist_id'] ?? 0;
        $raw_message = $data['message'] ?? '';
        
        if (empty($raw_message)) {
            echo json_encode(['success' => false, 'error' => 'Message is empty']);
            exit;
        }

        $filtered_message = $raw_message;
        $has_violation = false;

        // 1. Regex to block Emails
        $filtered_message = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i', '****', $filtered_message, -1, $count);
        if ($count > 0) $has_violation = true;

        // 2. Regex to block URLs
        $filtered_message = preg_replace('/https?:\/\/[^\s]+/i', '****', $filtered_message, -1, $count);
        if ($count > 0) $has_violation = true;

        // 3. Regex to block Phone Numbers (7 or more consecutive digits/symbols)
        $filtered_message = preg_replace('/(?:\d[\W_]*){7,}/', '****', $filtered_message, -1, $count);
        if ($count > 0) $has_violation = true;

        // 4. Block Suspicious Keywords
        $suspicious_keywords = ['whatsapp', 'call me', 'insta', 'instagram', 'dm me', 'telegram'];
        foreach ($suspicious_keywords as $keyword) {
            if (stripos($filtered_message, $keyword) !== false) {
                // Use regex for case-insensitive replacement of the exact word
                $filtered_message = preg_replace("/\b" . preg_quote($keyword, '/') . "\b/i", '****', $filtered_message);
                $has_violation = true;
            }
        }

        // If a violation was found, increment the user's violation count
        if ($has_violation) {
            $violStmt = $pdo->prepare("UPDATE users SET violations = violations + 1 WHERE id = ?");
            $violStmt->execute([$user_id]);
        }

        // Insert the filtered message into the database
        // Note: For this marketplace, we assume the logged-in user is sending it.
        $stmt = $pdo->prepare("INSERT INTO messages (user_id, artist_id, sender, message) VALUES (?, ?, 'user', ?)");
        $stmt->execute([$user_id, $artist_id, $filtered_message]);

        echo json_encode([
            'success' => true, 
            'message' => $filtered_message,
            'violation_flagged' => $has_violation
        ]);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}
?>