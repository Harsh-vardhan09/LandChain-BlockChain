# RBAC Quick Reference

## Role Hierarchy
- **user**: Basic user - can register lands, view details
- **admin**: Super user - can verify lands, manage user roles

## Backend Quick Reference

### Middleware Stack
```javascript
// No auth needed
app.get("/land/:id", handler)

// User authentication (fetches role from DB)
app.post("/land/register", authMiddleware, handler)

// Admin only
app.post("/land/verify", authMiddleware, requireAdmin, handler)

// Owner or admin
app.post("/land/transfer", authMiddleware, requireOwnerOrAdmin, handler)

// Specific roles
app.get("/route", authMiddleware, requireRole(["admin", "moderator"]), handler)
```

### Header Required for All Protected Routes
```
x-wallet-address: 0x1234567890abcdef...
```

## Frontend Quick Reference

### Import Components
```javascript
import { useWallet } from '../context/WalletContext'
import { RoleGuard, useIsAdmin, useHasRole } from '../components/RoleGuard'
import { ProtectedRoute } from '../components/ProtectedRoute'
```

### Get User Role
```javascript
const { role, roleLoading } = useWallet()
```

### Check Permissions
```javascript
const isAdmin = useIsAdmin()
const canEdit = useHasRole("admin")
```

### Show/Hide UI
```javascript
<RoleGuard requiredRole="admin">
  <AdminButton />
</RoleGuard>
```

### Protect Routes
```javascript
<Route
  path="/admin"
  element={<ProtectedRoute element={<AdminPanel />} requiredRole="admin" />}
/>
```

## API Endpoints

### User Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/role` | ✓ | Get current user's role |
| POST | `/land/register` | ✓ | Register new land |
| POST | `/land/transfer` | ✓ | Transfer land ownership |
| GET | `/land/:id` | - | Get land details |

### Admin Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/land/verify` | ✓ Admin | Verify a land |
| GET | `/admin/users` | ✓ Admin | List all users |
| PUT | `/admin/users/:address/role` | ✓ Admin | Change user role |

## Setup Checklist

- [x] User model with role field
- [x] Authentication middleware
- [x] Role validation middleware
- [x] Backend routes protected
- [x] WalletContext updated with role management
- [x] ProtectedRoute component created
- [x] RoleGuard component created
- [x] AdminPanel component created
- [x] ConnectWallet shows role badge
- [x] Dashboard shows role-based UI
- [x] API service supports auth headers

## First Time Setup

1. **Initial Admin User** (via MongoDB):
   ```javascript
   db.users.updateOne(
     { walletAddress: "0xyouraddress" },
     { $set: { role: "admin" } },
     { upsert: true }
   )
   ```

2. **Check Role Was Set**:
   ```javascript
   db.users.findOne({ walletAddress: "0xyouraddress" })
   // Should show: { role: "admin" }
   ```

3. **Connect to App**:
   - Connect MetaMask with that address
   - Should see "ADMIN" badge in header
   - "Admin Panel" link should appear

## Testing

### Test User Flow
1. Connect as regular user
2. Register a land - should succeed
3. Try to verify a land - should get 403 error
4. Visit /admin - should get access denied

### Test Admin Flow
1. Connect as admin
2. Visit /admin panel - should open
3. List users - should see all users
4. Change user role - should update
5. Verify a land - should succeed

## Debugging

### Check User Role in DB
```javascript
db.users.findOne({ walletAddress: "0x..." })
```

### Check Request Headers (Browser DevTools)
```
Network tab → Click request → Headers
Look for: x-wallet-address: 0x...
```

### Check Backend Logs
```
Auth middleware error: Check middleware is being called
Failed to fetch role: Check backend is running
```

### Reset User Role
```javascript
db.users.updateOne(
  { walletAddress: "0x..." },
  { $set: { role: "user" } }
)
```

## Common Operations

### Change User to Admin
```bash
curl -X PUT http://localhost:3000/admin/users/0x123.../role \
  -H "x-wallet-address: 0xadmin..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Get All Users
```bash
curl http://localhost:3000/admin/users \
  -H "x-wallet-address: 0xadmin..."
```

### Verify Land (Admin Only)
```bash
curl -X POST http://localhost:3000/land/verify \
  -H "x-wallet-address: 0xadmin..." \
  -H "Content-Type: application/json" \
  -d '{"id": "LAND001"}'
```
