# Social Login Fix - TODO

**Status: In Progress**

## Completed
- [x] Analysis of files and issue identification  
- [x] User plan approval

## To Do
1. [x] **Add Google OAuth routes** to Backend/routes/api.php (critical - causes 404) ✅
2. [ ] **Verify frontend button** works (user says already exists)
3. [ ] **Configure Backend/.env** with real Google credentials:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   ```
4. [ ] **Test full flow**: Login page → Click Google → Google consent → Auto-login on app
5. [ ] **Docker adjustment** if using docker-compose (update REDIRECT_URI)
6. [ ] Mark complete ✓

**Next step**: Configure .env and test!

**Next step**: Adding routes...
