# Real-Time Debugging Guide

## Current Status
✅ **Frontend Fixes Applied:**
- Added debugging logs to all socket event handlers
- Fixed socket connection to pass both userId and userEmail
- Fixed event listener dependencies in useEffect
- Added SocketDebugger component to monitor events in real-time
- Updated socket room joining/leaving with proper debugging

✅ **Backend Fixes Applied:**
- Added email-based member role update endpoint
- Added email-based member removal endpoint  
- Added leave_dashboard event handler (missing before)
- Fixed socket event emissions with correct names

## Testing Steps

### 1. Check Socket Connection
1. Open browser dev console
2. Look for: `🔗 Connected to WebSocket server with ID: [socket-id]`
3. Check SocketDebugger component (bottom-right corner) shows "Connected"

### 2. Test Dashboard Room Joining
1. Navigate to a dashboard
2. Look for console logs: 
   - `🏠 Setting active dashboard: [dashboard-name]`
   - `🚪 Joining dashboard room: [dashboard-id]`
   - `✅ Emitted join_dashboard event`

### 3. Test Member Role Updates
1. Open two browser windows/tabs with different users
2. In one window, change a member's role
3. Check for console logs in the other window:
   - `🔄 Member role updated event received: [data]`
   - `✅ Updating member role in active dashboard`

### 4. Test Member Removal
1. Open two browser windows/tabs
2. Remove a member in one window
3. Check for console logs in the other window:
   - `🗑️ Member removed event received: [data]`
   - `✅ Removing member from active dashboard`

### 5. Test Task Drag & Drop Real-Time Updates
1. Open two browser windows/tabs with different users
2. Navigate to the same dashboard/TaskBoard
3. In one window, drag a task from one column to another (e.g., To-Do to In Progress)
4. Check for console logs in the other window:
   - `🔄 Task moved event received: [data]`
   - `✅ Moving task in real-time: [details]`
   - Task should move automatically in the second window

### 6. Test Task Creation/Updates
1. Create or edit a task in one window
2. Check if it appears/updates in real-time in other windows
3. Look for console logs:
   - `📝 Dashboard task created event received: [data]`
   - `📝 Dashboard task updated event received: [data]`

## Common Issues & Solutions

### Issue 1: Socket Not Connecting
**Symptoms:** SocketDebugger shows "Disconnected"
**Solutions:**
- Ensure backend is running on correct port (5000)
- Check CORS configuration in backend
- Verify SOCKET_URL in socket.jsx points to correct backend

### Issue 2: Events Not Being Received  
**Symptoms:** No console logs for events
**Solutions:**
- Check if user is joined to correct rooms
- Verify backend is emitting events with correct names
- Check network tab for WebSocket connection

### Issue 3: Member Updates Not Working
**Symptoms:** Frontend updates locally but other clients don't see changes
**Solutions:**
- Verify backend endpoints are working (check backend console)
- Ensure socket events are being emitted after database updates
- Check if dashboard rooms are properly joined

### Issue 4: Drag & Drop Not Working in Real-Time
**Symptoms:** Tasks move locally but don't update in other browser windows
**Solutions:**
- Check if task_moved events are being emitted by backend
- Verify TaskBoard is using DashboardContext's dashboardTasks
- Ensure socket listeners for task_moved are registered
- Check browser console for task movement event logs

### Issue 4: Port Conflicts
**Symptoms:** Frontend can't connect to backend
**Solutions:**
- Frontend is on port 5176, backend should be on 5000
- Update SOCKET_URL if backend is on different port

## Backend Requirements

Make sure your backend includes these fixes from `backend-fixes.js`:

1. **Member Role Update Endpoint:**
   ```javascript
   app.patch("/dashboards/:dashboardId/members/:memberEmail", ...)
   ```

2. **Member Removal Endpoint:**
   ```javascript
   app.delete("/dashboards/:dashboardId/members/:memberEmail", ...)
   ```

3. **Leave Dashboard Event Handler:**
   ```javascript
   socket.on("leave_dashboard", (dashboardId) => { ... })
   ```

4. **Correct Event Emissions:**
   - `io.emit("dashboard_member_role_updated", ...)`
   - `io.emit("dashboard_member_removed", ...)`

## Next Steps

1. **Start your backend server** with the fixes from backend-fixes.js
2. **Open the frontend** at http://localhost:5176
3. **Check the SocketDebugger** in bottom-right corner
4. **Test with multiple browser tabs** to verify real-time updates
5. **Monitor console logs** for debugging information

If issues persist, check:
- Backend console for error messages
- Network tab for failed API requests
- WebSocket connection status
- Database updates are happening correctly
