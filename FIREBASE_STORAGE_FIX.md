# Firebase Storage Permissions Fix

## Problem
Image uploads are failing with "User does not have permission to access" errors.

## Solution
You need to update Firebase Storage rules manually.

## Step-by-Step Instructions

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/esplanada-eats/storage/rules

### 2. Replace Rules Content
Copy the entire content from `storage.rules` file and replace the existing rules.

### 3. Click "Publish"

## Alternative: Use Firebase CLI
If you have Firebase CLI installed:

```bash
firebase deploy --only storage:rules
```

## What the New Rules Do
- ✅ Allow anonymous users to upload images
- ✅ Validate image type (JPEG, PNG, WebP only)
- ✅ Validate image size (max 5MB)
- ✅ Allow public reading of images
- ✅ Support multiple upload paths as fallbacks

## Testing After Update
1. Try creating a new restaurant with photos
2. Check browser console for success messages
3. Verify photos appear in restaurant cards

## Troubleshooting
If upload still fails:
1. Check Firebase Console for errors
2. Verify rules were published successfully
3. Check browser console for specific error messages

## Current Upload Paths (Fallback System)
1. `restaurant-photos/public/{restaurantId}/{fileName}`
2. `temp-photos/{fileName}`
3. `public-photos/{fileName}`

The system will try each path until one succeeds.