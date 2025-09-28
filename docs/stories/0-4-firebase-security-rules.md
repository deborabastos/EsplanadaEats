# Story 0.4: Firebase Security Rules

**As a developer, I want to implement Firebase Security Rules, so that data access is properly controlled and secured.**

## Overview
This story implements comprehensive Firebase Security Rules that control access to Firestore databases and Firebase Storage, ensuring data security and preventing unauthorized access or abuse.

## Acceptance Criteria

### AC 4.1: Security rules for restaurants collection (read all, create authenticated)
- [ ] Create security rules allowing public read access to restaurants
- [ ] Require authentication for restaurant creation
- [ ] Validate restaurant data structure on creation
- [ ] Allow restaurant owners to update their own restaurants
- [ ] Implement proper indexing for security rules

### AC 4.2: Security rules for reviews collection (read all, create authenticated)
- [ ] Create security rules allowing public read access to reviews
- [ ] Require authentication for review creation
- [ ] Validate review data and rating values
- [ ] Prevent users from modifying others' reviews
- [ ] Allow users to delete their own reviews

### AC 4.3: Security rules for duplicate prevention collection
- [ ] Create security rules for user-restaurant tracking
- [ ] Allow users to read their own tracking data
- [ ] Prevent users from accessing others' tracking data
- [ ] Validate tracking data structure
- [ ] Implement proper access controls for duplicate checking

### AC 4.4: Security rules for Firebase Storage bucket
- [ ] Create security rules for restaurant photo uploads
- [ ] Validate file types and sizes for uploads
- [ ] Allow users to manage their own restaurant photos
- [ ] Prevent unauthorized access to uploaded files
- [ ] Implement proper file path validation

### AC 4.5: Input validation and sanitization rules
- [ ] Validate restaurant name length and content
- [ ] Validate rating values (0-5 stars)
- [ ] Validate price ranges and format
- [ ] Sanitize text inputs to prevent injection attacks
- [ ] Validate image file types and metadata

### AC 4.6: Rate limiting and abuse prevention rules
- [ ] Implement rate limiting for restaurant creation
- [ ] Implement rate limiting for review submissions
- [ ] Prevent spam through frequency restrictions
- [ ] Implement bot detection and prevention
- [ ] Monitor and flag suspicious activity patterns

## Technical Implementation Details

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isValidRestaurant(data) {
      return data.name is string &&
             data.name.size() >= 4 &&
             data.name.size() <= 100 &&
             data.averageQuality is number &&
             data.averageQuality >= 0 &&
             data.averageQuality <= 5 &&
             data.price is number &&
             data.price > 0 &&
             data.createdAt is timestamp &&
             data.updatedAt is timestamp;
    }

    function isValidReview(data) {
      return data.restaurantId is string &&
             data.rating is number &&
             data.rating >= 0 &&
             data.rating <= 5 &&
             data.userId is string &&
             data.createdAt is timestamp;
    }

    function isValidUserTracking(data) {
      return data.userId is string &&
             data.restaurantId is string &&
             data.hasReviewed is bool &&
             data.createdAt is timestamp;
    }

    // Restaurants collection
    match /restaurants/{restaurantId} {
      allow read: if true; // Public read access
      allow create: if request.auth != null &&
                     isValidRestaurant(request.resource.data);
      allow update: if request.auth != null &&
                     request.auth.uid == resource.data.ownerId &&
                     isValidRestaurant(request.resource.data);
      allow delete: if request.auth != null &&
                     request.auth.uid == resource.data.ownerId;
    }

    // Reviews collection
    match /reviews/{reviewId} {
      allow read: if true; // Public read access
      allow create: if request.auth != null &&
                     isValidReview(request.resource.data);
      allow update: if request.auth != null &&
                     request.auth.uid == resource.data.userId &&
                     isValidReview(request.resource.data);
      allow delete: if request.auth != null &&
                     request.auth.uid == resource.data.userId;
    }

    // User tracking collection for duplicate prevention
    match /userTracking/{trackingId} {
      allow read: if request.auth != null &&
                  request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
                     isValidUserTracking(request.resource.data);
      allow update: if request.auth != null &&
                     request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null &&
                     request.auth.uid == resource.data.userId;
    }

    // Rate limiting collection
    match /rateLimits/{limitId} {
      allow read, write: if false; // System only
    }
  }
}
```

### Firebase Storage Security Rules
```javascript
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
             request.resource.size < 5 * 1024 * 1024 && // 5MB limit
             request.resource.name.matches('^[a-zA-Z0-9-_./]+$');
    }

    function isUserPhotoOwner(userId, path) {
      return path.matches('^restaurant-photos/' + userId + '/.*$');
    }

    // Restaurant photos
    match /restaurant-photos/{userId}/{restaurantId}/{photoId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null &&
                    request.auth.uid == userId &&
                    isValidImage();
    }

    // General photo uploads (legacy support)
    match /restaurant-photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && isValidImage();
    }
  }
}
```

### Rate Limiting Implementation
```javascript
// Rate limiting service (client-side implementation)
class RateLimiter {
  constructor() {
    this.limits = {
      restaurantCreation: { max: 3, window: 3600000 }, // 3 per hour
      reviewSubmission: { max: 10, window: 3600000 }, // 10 per hour
      photoUpload: { max: 20, window: 3600000 } // 20 per hour
    };
    this.userActions = new Map();
  }

  async checkRateLimit(userId, actionType) {
    const limit = this.limits[actionType];
    if (!limit) return true;

    const now = Date.now();
    const userKey = `${userId}_${actionType}`;
    const actions = this.userActions.get(userKey) || [];

    // Clean old actions
    const recentActions = actions.filter(time => now - time < limit.window);

    if (recentActions.length >= limit.max) {
      throw new Error(`Rate limit exceeded for ${actionType}`);
    }

    // Record this action
    recentActions.push(now);
    this.userActions.set(userKey, recentActions);

    return true;
  }

  // Server-side rate limiting (Cloud Functions)
  static async serverRateLimit(userId, actionType) {
    const limitRef = db.collection('rateLimits')
      .doc(`${userId}_${actionType}_${Date.now()}`);

    // Check recent actions
    const recentActions = await db.collection('rateLimits')
      .where('userId', '==', userId)
      .where('actionType', '==', actionType)
      .where('timestamp', '>', Date.now() - 3600000)
      .count()
      .get();

    const limits = {
      restaurantCreation: 3,
      reviewSubmission: 10,
      photoUpload: 20
    };

    if (recentActions.data().count >= limits[actionType]) {
      throw new Error('Rate limit exceeded');
    }

    // Record action
    await limitRef.set({
      userId,
      actionType,
      timestamp: Date.now()
    });
  }
}
```

### Input Validation
```javascript
// Input validation service
class InputValidator {
  // Restaurant validation
  static validateRestaurant(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Nome do restaurante é obrigatório');
    } else if (data.name.length < 4) {
      errors.push('Nome do restaurante deve ter no mínimo 4 caracteres');
    } else if (data.name.length > 100) {
      errors.push('Nome do restaurante deve ter no máximo 100 caracteres');
    } else if (!/^[a-zA-Z0-9\sÀ-ÿ'-]+$/.test(data.name)) {
      errors.push('Nome do restaurante contém caracteres inválidos');
    }

    // Price validation
    if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Preço deve ser um número positivo');
    } else if (data.price > 10000) {
      errors.push('Preço não pode exceder R$ 10.000');
    }

    // Rating validation
    if (data.averageQuality !== undefined) {
      if (typeof data.averageQuality !== 'number' ||
          data.averageQuality < 0 ||
          data.averageQuality > 5) {
        errors.push('Qualidade média deve estar entre 0 e 5');
      }
    }

    return errors;
  }

  // Review validation
  static validateReview(data) {
    const errors = [];

    // Rating validation
    if (!data.rating || typeof data.rating !== 'number' ||
        data.rating < 0 || data.rating > 5) {
      errors.push('Avaliação deve estar entre 0 e 5 estrelas');
    }

    // Restaurant ID validation
    if (!data.restaurantId || typeof data.restaurantId !== 'string') {
      errors.push('ID do restaurante é obrigatório');
    }

    return errors;
  }

  // Image validation
  static validateImage(file) {
    const errors = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      errors.push('Formato de imagem inválido. Use JPG, PNG ou WebP');
    }

    if (file.size > maxSize) {
      errors.push('Imagem muito grande. Tamanho máximo: 5MB');
    }

    return errors;
  }
}
```

## Dependencies
- Story 0.1: Firebase Project Configuration (must be completed first)
- Firebase project with Firestore and Storage enabled
- Understanding of Firebase Security Rules syntax

## Success Metrics
- Security rules properly restrict unauthorized access
- All data validation rules work correctly
- Rate limiting prevents abuse while allowing legitimate use
- File upload restrictions are properly enforced
- No security vulnerabilities in rule configuration

## Testing Approach
1. **Security Rules Test**: Verify rules allow/deny access as expected
2. **Input Validation Test**: Test all validation scenarios with valid and invalid data
3. **Rate Limiting Test**: Verify rate limits prevent abuse
4. **File Upload Test**: Test file type and size restrictions
5. **Integration Test**: Ensure security rules work with application logic

## Notes
- Security rules start in test mode for development
- Production rules should be more restrictive
- Regular security audits should be performed
- Monitor Firebase console for security rule violations
- Consider implementing Cloud Functions for complex security logic
- Keep security rules simple and maintainable