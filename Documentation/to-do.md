2. Use Trim() on backend when creating entities
3. Use lowercase or uppercase when comparing entities
4. Investigate error that occurs when logging in first time after refresh token expires and it continuously sends logout and refresh request
5. Ensure client is decent for smaller screen sizes
6. Add loading element when validating new providers, notifications, tests etc

   2. Added for Guards
   3. Added for database connection
   4. Added for notification provider
7. Have guard notification table webpage refresh when new guard is added so it can display new notifications
8. Create cleanup background service to remove old and revoked refresh tokens.
9. Log each time a guard runs in database and configure retention days then have background service remove old logs
10. Fix console errors in notification config for id 8

