### Environment variables -> Edit as needed
 - locations_table	device_locations
 - table_name	lora-sensor-uplink-data
 - triangulation_status	triangulation_status
 - triangulation_table	triangulated_gunshots

#### Needs SNS and DynamoDB permissions
### Needs numpy, scipy, sympy, requests library dependencies
 - NumPy - arn:aws:lambda:us-west-2:027537027602:layer:numpy_scipy_38:1
 - Use Klayers-p39-sympy layer - arn:aws:lambda:us-west-2:770693421928:layer:Klayers-p39-sympy:2
 - Use Klayers-p38-requests layer - arn:aws:lambda:us-west-2:770693421928:layer:Klayers-p38-requests:2

#### Triggered through the server