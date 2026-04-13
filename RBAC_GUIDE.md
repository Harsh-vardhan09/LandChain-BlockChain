# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This Land Management system implements role-based access control (RBAC) to manage user permissions. Users have two possible roles:

- **user**: Regular users can register lands and view land details
- **admin**: Admins can perform all user actions plus verify lands and manage user roles

## Architecture

### Backend Implementation

#### 1. User Model
The `User` model stores user roles in MongoDB:

```javascript
{
  walletAddress: String (unique, lowercase),
  role: String (enum: ["admin", "user"], default: "user"),
  timestamps
}
```

#### 2. Authentication Middleware
**File**: `middleware/authMiddleware.js`

- Extracts wallet address from request header `x-wallet-address`
- Fetches user from database, creating if needed
- Attaches user info to `req.user` object

**Usage**:
```javascript
app.post("/protected-route", authMiddleware, handler)
```

#### 3. Role Validation Middleware
**File**: `middleware/roleMiddleware.js`

Three main functions:

- **`requireRole(roles)`**: Generic role checker
  ```javascript
  app.post("/admin-route", authMiddleware, requireRole("admin"), handler)
  ```

- **`requireAdmin`**: Shorthand for admin-only routes
  ```javascript
  app.post("/land/verify", authMiddleware, requireAdmin, handler)
  ```

- **`requireOwnerOrAdmin`**: Check data ownership or admin status
  ```javascript
  app.post("/land/transfer", authMiddleware, requireOwnerOrAdmin, handler)
  ```

### Backend Routes

#### Public Routes
- `GET /user/role` - Get current user's role info
  - **Auth**: `authMiddleware`
  - **Returns**: `{ walletAddress, role, userId }`

#### User Routes (All authenticated users)
- `POST /land/register` - Register new land
  - **Auth**: `authMiddleware`
  - **Validation**: User can only register for their own wallet (unless admin)

- `GET /land/:id` - Get land details
  - **Public**: No auth required

- `POST /land/transfer` - Transfer land ownership
  - **Auth**: `authMiddleware`
  - **Validation**: Only owner or admin can transfer

#### Admin Routes
- `POST /land/verify` - Verify a land
  - **Auth**: `authMiddleware, requireAdmin`
  - **Only**: Admins can verify lands

- `GET /admin/users` - List all users
  - **Auth**: `authMiddleware, requireAdmin`
  - **Returns**: Array of users with roles

- `PUT /admin/users/:walletAddress/role` - Change user role
  - **Auth**: `authMiddleware, requireAdmin`
  - **Body**: `{ role: "admin" | "user" }`

## Frontend Implementation

### 1. WalletContext
**File**: `frontend/src/context/WalletContext.jsx`

Enhanced with role management:
- `role`: Current user's role
- `roleLoading`: Loading state for role fetch
- `fetchUserRole(walletAddress)`: Manually fetch role

**Usage in components**:
```javascript
const { account, isConnected, role, roleLoading } = useWallet()
```

### 2. ProtectedRoute Component
**File**: `frontend/src/components/ProtectedRoute.jsx`

Protect entire routes based on role:

```javascript
<Route
  path="/admin"
  element={<ProtectedRoute element={<AdminPanel />} requiredRole="admin" />}
/>
```

Features:
- Blocks unauthorized access
- Shows loading state while fetching role
- Redirects to home if not connected
- Customizable fallback component

### 3. RoleGuard Component
**File**: `frontend/src/components/RoleGuard.jsx`

Conditionally render UI based on role:

```javascript
<RoleGuard requiredRole="admin">
  <AdminOnlyFeature />
</RoleGuard>

// With fallback
<RoleGuard requiredRole="admin" fallback={<p>Admin only</p>}>
  <AdminFeature />
</RoleGuard>
```

#### Additional Hooks

**`useHasRole(requiredRole)`**:
```javascript
const isAdmin = useHasRole("admin")
if (isAdmin) { /* show admin button */ }
```

**`useIsAdmin()`**:
```javascript
const isAdmin = useIsAdmin()
```

**`RoleRenderer`** - Multi-role rendering:
```javascript
<RoleRenderer
  roleComponents={{
    admin: <AdminView />,
    user: <UserView />,
  }}
  fallback={<LoadingView />}
/>
```

### 4. AdminPanel Component
**File**: `frontend/src/components/AdminPanel.jsx`

Full-featured admin interface:
- List all users
- View current roles
- Change user roles
- Real-time updates

### 5. Updated ConnectWallet Component
Shows:
- User's wallet address
- User's role badge
- Link to admin panel (for admins only)

### 6. Updated Dashboard
Now displays:
- Current user's role
- Admin-only land verification section
- Role-specific operations

## Authentication Flow

### Backend Request Flow
```
1. Client sends request with header: x-wallet-address: 0x123...
2. authMiddleware extracts address
3. authMiddleware queries database for user
4. If user doesn't exist, create with default "user" role
5. Attach user info to req.user
6. roleMiddleware checks if user has required role
7. If authorized, proceed to handler
8. If not authorized, return 403 Forbidden
```

### Frontend Request Flow
```
1. User connects MetaMask wallet
2. WalletContext stores account and calls fetchUserRole()
3. fetchUserRole() calls GET /user/role with x-wallet-address header
4. Backend returns user's role
5. Role stored in WalletContext
6. Components re-render with role information
7. UI elements show/hide based on role
```

## Setting Admin Users

### Method 1: Direct Database
```bash
db.users.updateOne(
  { walletAddress: "0x..." },
  { $set: { role: "admin" } }
)
```

### Method 2: Admin API
Admin can change other users' roles:

```bash
curl -X PUT http://localhost:3000/admin/users/0x123.../role \
  -H "x-wallet-address: 0xadmin..." \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Method 3: Admin Panel UI
1. Connect as admin
2. Click "Admin Panel" link in header
3. Find user in list
4. Click "Change Role"
5. Select new role and confirm

## Usage Examples

### Backend - Protected Route
```javascript
// Admin-only route
app.delete("/admin/users/:id", authMiddleware, requireAdmin, async (req, res) => {
  // Only admins reach here
  res.json({ message: "User deleted" })
})

// Owner or admin route
app.post("/lands/:id/update", authMiddleware, requireOwnerOrAdmin, async (req, res) => {
  // Only owner or admin reach here
  res.json({ message: "Land updated" })
})
```

### Frontend - Conditional Rendering
```javascript
import { RoleGuard, useIsAdmin } from '../components/RoleGuard'

function MyComponent() {
  const isAdmin = useIsAdmin()

  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Show to all users */}
      <button>View Lands</button>
      
      {/* Show only to admins */}
      <RoleGuard requiredRole="admin">
        <button>Verify Land</button>
      </RoleGuard>

      {/* Conditional rendering */}
      {isAdmin && <AdminControls />}
    </div>
  )
}
```

### Frontend - Protected Routes
```javascript
import { ProtectedRoute } from './components/ProtectedRoute'

<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route
    path="/admin"
    element={
      <ProtectedRoute
        element={<AdminPanel />}
        requiredRole="admin"
      />
    }
  />
</Routes>
```

## Security Considerations

1. **Always validate on backend**: Frontend role checks are for UX only
2. **Every protected endpoint needs authMiddleware + roleMiddleware**
3. **Wallet address validation**: x-wallet-address header must match authenticated account
4. **No sensitive data in frontend**: Role is fetched fresh from database
5. **CORS**: Configure properly to prevent unauthorized requests
6. **HTTPS**: Always use HTTPS in production

## Error Handling

### 401 Unauthorized
- Missing wallet address header
- User not found (will be created)

### 403 Forbidden
- User role doesn't match required role
- User attempting action on others' data (without admin role)

### 400 Bad Request
- Invalid role value
- Missing required fields

## Common Issues

### "Access Denied" Error
**Cause**: User's role doesn't have permission
**Solution**:
1. Check user's current role in admin panel
2. Verify endpoint requires expected role
3. Update user role if needed

### Role Not Loading in Frontend
**Cause**: authMiddleware not called or header missing
**Solution**:
1. Verify `x-wallet-address` header is sent
2. Check network tab in browser DevTools
3. Verify backend is running and connected to MongoDB

### New Users Created as Admin
**Cause**: Shouldn't happen - default is "user"
**Solution**: Clear database and reconnect

## Database Schema

```javascript
// Users Collection
{
  _id: ObjectId,
  walletAddress: "0x...", // Required, Unique, Lowercase
  role: "user", // or "admin"
  createdAt: Date,
  updatedAt: Date
}

// Lands Collection (existing)
{
  _id: ObjectId,
  landId: String,
  location: String,
  area: Number,
  owner: String (wallet address),
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Next Steps

1. **Environment Setup**:
   ```bash
   MONGODB_URI=mongodb://...
   PORT=3000
   ```

2. **First Admin Setup**:
   - Register with first account
   - Update MongoDB directly to set role="admin"
   - Can then manage other users via API

3. **Test the System**:
   - Connect as regular user, verify can register lands
   - Connect as admin, verify can see admin panel
   - Test role-based UI rendering

4. **Monitor Access**:
   - Check logs for unauthorized access attempts
   - Monitor admin actions for audit trail
