INSERT INTO violations (timestamp, latitude, longitude, h3_cell, junction_name, police_station, vehicle_type, violation_type)
VALUES
('2026-06-15 08:30:00+05:30', 12.9716, 77.5946, 'h3-mg-road', 'MG Road Metro', 'Cubbon Park', 'Car', 'No Parking'),
('2026-06-15 09:10:00+05:30', 12.9767, 77.5713, 'h3-majestic', 'Majestic Bus Stand', 'Upparpet', 'Two Wheeler', 'Footpath Parking'),
('2026-06-15 18:20:00+05:30', 12.9352, 77.6245, 'h3-koramangala', 'Sony World Junction', 'Koramangala', 'Car', 'Obstructive Parking'),
('2026-06-15 19:00:00+05:30', 12.9784, 77.6408, 'h3-indiranagar', 'Indiranagar 100 Feet Road', 'Indiranagar', 'Auto', 'No Parking'),
('2026-06-16 11:15:00+05:30', 12.9141, 77.6101, 'h3-jayanagar', 'Jayanagar 4th Block', 'Jayanagar', 'Car', 'Bus Lane Parking')
ON CONFLICT DO NOTHING;
