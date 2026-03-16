<?php
/**
 * Backend API Endpoint for Hotel Booking
 * This file should be placed in your Laravel/PHP backend API routes
 * Route: POST /api/destinations/book
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database connection (XAMPP default credentials)
$host = 'localhost';
$dbname = 'booking_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed']);
    exit;
}

// Get the request data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid JSON data']);
    exit;
}

// Validate required fields
$requiredFields = ['user_id', 'name', 'type', 'location', 'price'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['message' => "Missing required field: $field"]);
        exit;
    }
}

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // Insert booking into destinations table
    $sql = "INSERT INTO destinations (
        user_id, 
        name, 
        type, 
        description, 
        location, 
        address, 
        price, 
        image, 
        images, 
        created_at, 
        updated_at
    ) VALUES (
        :user_id,
        :name,
        :type,
        :description,
        :location,
        :address,
        :price,
        :image,
        :images,
        NOW(),
        NOW()
    )";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':address', $data['address']);
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':image', $data['image']);
    
    // Handle images array (convert to JSON)
    $imagesJson = json_encode($data['images'] ?? []);
    $stmt->bindParam(':images', $imagesJson);
    
    $stmt->execute();
    
    // Get the inserted booking ID
    $bookingId = $pdo->lastInsertId();
    
    // If you have a separate bookings table, you might want to insert there too
    // This ensures you don't lose any existing destination data
    
    // Optional: Create a separate booking_details table for extended information
    if (!empty($data['booking_details'])) {
        $bookingDetailsSql = "INSERT INTO booking_details (
            destination_id,
            room_type,
            room_category,
            guests,
            max_occupancy,
            nightly_price,
            nights,
            room_subtotal,
            cleaning_fee,
            service_fee,
            total_price,
            check_in,
            check_out,
            hotel_id,
            hotel_name,
            hotel_location,
            created_at
        ) VALUES (
            :destination_id,
            :room_type,
            :room_category,
            :guests,
            :max_occupancy,
            :nightly_price,
            :nights,
            :room_subtotal,
            :cleaning_fee,
            :service_fee,
            :total_price,
            :check_in,
            :check_out,
            :hotel_id,
            :hotel_name,
            :hotel_location,
            NOW()
        )";
        
        $detailsStmt = $pdo->prepare($bookingDetailsSql);
        
        $details = $data['booking_details'];
        $detailsStmt->bindParam(':destination_id', $bookingId);
        $detailsStmt->bindParam(':room_type', $details['roomType']);
        $detailsStmt->bindParam(':room_category', $details['roomCategory']);
        $detailsStmt->bindParam(':guests', $details['guests']);
        $detailsStmt->bindParam(':max_occupancy', $details['maxOccupancy']);
        $detailsStmt->bindParam(':nightly_price', $details['nightlyPrice']);
        $detailsStmt->bindParam(':nights', $details['nights']);
        $detailsStmt->bindParam(':room_subtotal', $details['roomSubtotal']);
        $detailsStmt->bindParam(':cleaning_fee', $details['cleaningFee']);
        $detailsStmt->bindParam(':service_fee', $details['serviceFee']);
        $detailsStmt->bindParam(':total_price', $details['totalPrice']);
        $detailsStmt->bindParam(':check_in', $details['checkIn']);
        $detailsStmt->bindParam(':check_out', $details['checkOut']);
        $detailsStmt->bindParam(':hotel_id', $details['hotelId']);
        $detailsStmt->bindParam(':hotel_name', $details['hotelName']);
        $detailsStmt->bindParam(':hotel_location', $details['hotelLocation']);
        
        $detailsStmt->execute();
    }
    
    // Commit transaction
    $pdo->commit();
    
    // Return success response
    http_response_code(201);
    echo json_encode([
        'message' => 'Booking created successfully',
        'booking_id' => $bookingId,
        'data' => [
            'id' => $bookingId,
            'user_id' => $data['user_id'],
            'name' => $data['name'],
            'type' => $data['type'],
            'location' => $data['location'],
            'price' => $data['price'],
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (PDOException $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    
    http_response_code(500);
    echo json_encode([
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    
    http_response_code(500);
    echo json_encode([
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

/*
SQL for creating the optional booking_details table:

CREATE TABLE IF NOT EXISTS booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    room_type VARCHAR(255) NOT NULL,
    room_category VARCHAR(255) NOT NULL,
    guests INT NOT NULL,
    max_occupancy INT NOT NULL,
    nightly_price DECIMAL(10,2) NOT NULL,
    nights INT NOT NULL,
    room_subtotal DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    hotel_id VARCHAR(255),
    hotel_name VARCHAR(255) NOT NULL,
    hotel_location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

*/
