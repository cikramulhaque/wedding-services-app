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
    
    // 1. Check current booking status between user and artist
    case 'check_status':
        $user_id = $_GET['user_id'] ?? 0;
        $artist_id = $_GET['artist_id'] ?? 0;

        $stmt = $pdo->prepare("SELECT id, payment_status, contact_unlocked, booking_date FROM bookings WHERE user_id = ? AND artist_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$user_id, $artist_id]);
        $booking = $stmt->fetch();

        if ($booking) {
            // If unlocked, fetch the actual contact info
            if ($booking['contact_unlocked'] == 1) {
                $artistStmt = $pdo->prepare("SELECT contact_info FROM artists WHERE id = ?");
                $artistStmt->execute([$artist_id]);
                $booking['contact_info'] = $artistStmt->fetchColumn();
            } else {
                $booking['contact_info'] = '[HIDDEN: Complete payment to unlock]';
            }
            echo json_encode(['success' => true, 'booking' => $booking]);
        } else {
            echo json_encode(['success' => true, 'booking' => null]);
        }
        break;

    // 2. Create a new pending booking
    case 'create_booking':
        $user_id = $data['user_id'] ?? 0;
        $artist_id = $data['artist_id'] ?? 0;
        $booking_date = $data['booking_date'] ?? '';

        if (!$booking_date) {
            echo json_encode(['success' => false, 'error' => 'Date is required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO bookings (user_id, artist_id, booking_date, payment_status, contact_unlocked) VALUES (?, ?, ?, 'pending', 0)");
        $stmt->execute([$user_id, $artist_id, $booking_date]);
        
        echo json_encode(['success' => true, 'booking_id' => $pdo->lastInsertId()]);
        break;

    // 3. Process payment and unlock contact
    case 'process_payment':
        $booking_id = $data['booking_id'] ?? 0;

        // Update status to paid and toggle contact_unlocked to 1
        $stmt = $pdo->prepare("UPDATE bookings SET payment_status = 'completed', contact_unlocked = 1 WHERE id = ?");
        $stmt->execute([$booking_id]);

        echo json_encode(['success' => true, 'message' => 'Payment successful, contact unlocked.']);
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        break;
}
?>