<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

// Utility: Filter messages to block contacts and URLs
function filterMessage($text) {
    // Block Emails
    $text = preg_replace('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[EMAIL BLOCKED]', $text);
    // Block URLs
    $text = preg_replace('/https?:\/\/[^\s]+/', 'https://www.merriam-webster.com/dictionary/blocked', $text);
    // Block Phone Numbers (7 or more digits)
    $text = preg_replace('/(?:\d[\W_]*){7,}/', '[PHONE BLOCKED]', $text);
    return $text;
}

switch ($action) {
    case 'login':
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();
        if (!$user) {
            $stmt = $pdo->prepare("INSERT INTO users (username) VALUES (?)");
            $stmt->execute([$data['username']]);
            $user = ['id' => $pdo->lastInsertId(), 'username' => $data['username']];
        }
        echo json_encode(['success' => true, 'user' => $user]);
        break;

    case 'categories':
        $stmt = $pdo->query("SELECT * FROM categories");
        echo json_encode($stmt->fetchAll());
        break;

    case 'artists':
        $stmt = $pdo->prepare("SELECT id, name, rating FROM artists WHERE category_id = ? ORDER BY rating DESC");
        $stmt->execute([$_GET['category_id']]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'artist_profile':
        $user_id = $_GET['user_id'];
        $artist_id = $_GET['artist_id'];
        
        $stmt = $pdo->prepare("SELECT id, name, rating, contact_info FROM artists WHERE id = ?");
        $stmt->execute([$artist_id]);
        $artist = $stmt->fetch();

        // Check if payment is completed to unlock contact info
        $checkPayment = $pdo->prepare("SELECT payment_status FROM bookings WHERE user_id = ? AND artist_id = ? AND payment_status = 'completed'");
        $checkPayment->execute([$user_id, $artist_id]);
        
        if (!$checkPayment->fetch()) {
            $artist['contact_info'] = '[HIDDEN: Complete booking to unlock]';
        }
        
        echo json_encode($artist);
        break;

    case 'send_message':
        $filtered_message = filterMessage($data['message']);
        $stmt = $pdo->prepare("INSERT INTO messages (user_id, artist_id, sender, message) VALUES (?, ?, 'user', ?)");
        $stmt->execute([$data['user_id'], $data['artist_id'], $filtered_message]);
        echo json_encode(['success' => true, 'message' => $filtered_message]);
        break;

    case 'get_messages':
        $stmt = $pdo->prepare("SELECT * FROM messages WHERE user_id = ? AND artist_id = ? ORDER BY created_at ASC");
        $stmt->execute([$_GET['user_id'], $_GET['artist_id']]);
        echo json_encode($stmt->fetchAll());
        break;

    case 'book':
        $stmt = $pdo->prepare("INSERT INTO bookings (user_id, artist_id, payment_status) VALUES (?, ?, 'completed')");
        $stmt->execute([$data['user_id'], $data['artist_id']]);
        echo json_encode(['success' => true]);
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
}
?>