# Authentication API Testing Suite (Postman)

These requests can be imported or typed identically into Postman to test the backend `cis-backend` endpoints running natively on Port `5000`.

### 1. Register User (POST)
**URL**: `http://localhost:5000/api/auth/register`
**Body (JSON)**:
```json
{
  "name": "Jane Doe",
  "email": "jane.investigator@govt.in",
  "phone": "9876543210",
  "password": "SecurePassword123!",
  "role": "investigator"
}
```

### 2. Login User (POST)
**URL**: `http://localhost:5000/api/auth/login`
**Body (JSON)**:
```json
{
  "email": "jane.investigator@govt.in",
  "password": "SecurePassword123!",
  "role": "investigator"
}
```

### 3. Google OAuth Login (POST)
**URL**: `http://localhost:5000/api/auth/google`
**Body (JSON)**:
```json
{
  "googleId": "1002345678912345",
  "name": "Alex Google",
  "email": "alex.test@gmail.com",
  "role": "public"
}
```

### 4. Send Mobile OTP (POST)
**URL**: `http://localhost:5000/api/auth/send-otp`
**Body (JSON)**:
```json
{
  "phone": "9876543210"
}
```

### 5. Verify Mobile OTP (POST)
*Check your NodeJS Server Logs to find the 6-Digit SMS Mock OTP output.*
**URL**: `http://localhost:5000/api/auth/verify-otp`
**Body (JSON)**:
```json
{
  "phone": "9876543210",
  "otp": "123456" 
}
```

### 6. Forgot Password (POST)
**URL**: `http://localhost:5000/api/auth/forgot-password`
**Body (JSON)**:
```json
{
  "email": "jane.investigator@govt.in"
}
```

### 7. Reset Password (POST)
*Check your NodeJS Server Logs to find the string Token generated from the Forgot Password request.*
**URL**: `http://localhost:5000/api/auth/reset-password`
**Body (JSON)**:
```json
{
  "email": "jane.investigator@govt.in",
  "token": "d2q9xw7y1",
  "newPassword": "NewStrongPass123!@"
}
```
