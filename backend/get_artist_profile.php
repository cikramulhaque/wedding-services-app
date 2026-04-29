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
    
    $artist_id = isset($_GET['artist_id']) ? (int)$_GET['artist_id'] : 0;
    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    if ($artist_id > 0) {
        // 1. Fetch Artist Details (including new price and location columns if added)
        // Using COALESCE to handle cases where price/location columns might not exist yet
        $stmt = $pdo->prepare("SELECT * FROM artists WHERE id = ?");
        $stmt->execute([$artist_id]);
        $artist = $stmt->fetch();

        if ($artist) {
            // 2. Strict Rule Check: Has this user paid for this artist?
            $checkPayment = $pdo->prepare("SELECT id FROM bookings WHERE user_id = ? AND artist_id = ? AND payment_status = 'completed'");
            $checkPayment->execute([$user_id, $artist_id]);
            $hasPaid = $checkPayment->fetch();

            if (!$hasPaid) {
                $artist['contact_info'] = '[HIDDEN: Complete booking to unlock contact details]';
            }

            // 3. Fetch full portfolio
            $portStmt = $pdo->prepare("SELECT id, image_url FROM portfolio WHERE artist_id = ?");
            $portStmt->execute([$artist_id]);
            $portfolio = $portStmt->fetchAll();

            echo json_encode([
                'success' => true, 
                'artist' => $artist,
                'portfolio' => $portfolio,
                'isBooked' => (bool)$hasPaid
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Artist not found']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid artist ID']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'Database query failed']);
}
?>