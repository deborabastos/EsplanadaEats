# Story 3.3: Rating Validation & Rules

## Status
Draft

## Story
**As a** user,
**I want** the system to validate my ratings,
**so that** only legitimate ratings are counted, preventing spam and improper manipulation of restaurant scores.

## Acceptance Criteria
1. System must validate rating data format before submission
2. Must implement protection against duplicate ratings from same user
3. Rate limiting must prevent multiple submissions in short period
4. User fingerprint validation for unique identification
5. System must detect and block bots and automated scripts
6. Must implement business rules for valid ratings
7. Clear feedback must be provided for rejected ratings
8. Security logs must record suspicious attempts
9. System must work offline and sync when online
10. Validation must occur on client and server (Firebase)

## Tasks / Subtasks
- [ ] Task 1: Implement data format validation (AC: 1)
  - [ ] Create rating data schema validation
  - [ ] Implement client-side validation before submission
  - [ ] Add server-side validation in Firebase rules
  - [ ] Validate rating ranges (1-5 stars)
- [ ] Task 2: Create duplicate protection system (AC: 2)
  - [ ] Implement user identification checking
  - [ ] Add database queries for existing ratings
  - [ ] Create user-restaurant tracking
  - [ ] Handle multiple device scenarios
- [ ] Task 3: Develop rate limiting mechanism (AC: 3)
  - [ ] Implement time-based submission limits
  - [ ] Add sliding window rate limiting
  - [ ] Create user-based rate tracking
  - [ ] Handle edge cases and exceptions
- [ ] Task 4: Build bot detection system (AC: 4, 5)
  - [ ] Implement user fingerprint analysis
  - [ ] Add behavioral pattern detection
  - [ ] Create automated script identification
  - [ ] Add CAPTCHA integration for suspicious activity
- [ ] Task 5: Implement business rules engine (AC: 6)
  - [ ] Create configurable validation rules
  - [ ] Add content filtering for inappropriate text
  - [ ] Implement rating consistency checks
  - [ ] Add temporal validation rules
- [ ] Task 6: Create user feedback system (AC: 7)
  - [ ] Design clear rejection messages
  - [ ] Implement user-friendly error explanations
  - [ ] Add guidance for proper rating submission
  - [ ] Create help documentation
- [ ] Task 7: Build security logging system (AC: 8)
  - [ ] Implement security event logging
  - [ ] Add suspicious activity detection
  - [ ] Create admin security dashboard
  - [ ] Add automated security alerts
- [ ] Task 8: Implement offline functionality (AC: 9)
  - [ ] Create offline rating queue
  - [ ] Add sync mechanism for online state
  - [ ] Implement conflict resolution
  - [ ] Add offline validation caching
- [ ] Task 9: Create server-side validation (AC: 10)
  - [ ] Implement Firebase security rules
  - [ ] Add server-side business logic validation
  - [ ] Create data integrity checks
  - [ ] Add audit trail for all submissions

## Dev Notes
This story implements comprehensive rating validation and rules to ensure data integrity, prevent fraud, and maintain the quality and reliability of the restaurant rating system.

## Technical Implementation

### Rating Validation Service
```javascript
// services/RatingValidationService.js
class RatingValidationService {
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.validationRules = this.initializeValidationRules();
    this.rateLimits = new Map();
    this.suspiciousPatterns = this.initializeSuspiciousPatterns();
  }

  initializeValidationRules() {
    return {
      rating: {
        min: 1,
        max: 5,
        required: true,
        type: 'integer'
      },
      restaurantId: {
        required: true,
        type: 'string',
        minLength: 1
      },
      userFingerprint: {
        required: true,
        type: 'string',
        minLength: 10
      },
      timestamp: {
        required: true,
        type: 'string',
        pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      }
    };
  }

  initializeSuspiciousPatterns() {
    return {
      rapidFire: {
        threshold: 5, // submissions
        timeframe: 60000, // 1 minute
        blockDuration: 300000 // 5 minutes
      },
      duplicateFingerprint: {
        threshold: 3, // same fingerprint
        timeframe: 3600000, // 1 hour
        blockDuration: 86400000 // 24 hours
      },
      suspiciousUserAgent: [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /automated/i,
        /test/i
      ]
    };
  }

  async validateRating(ratingData) {
    const validationErrors = [];

    // Step 1: Data format validation
    const formatValidation = this.validateDataFormat(ratingData);
    if (!formatValidation.isValid) {
      validationErrors.push(...formatValidation.errors);
    }

    // Step 2: Rate limiting check
    const rateLimitCheck = await this.checkRateLimits(ratingData);
    if (!rateLimitCheck.allowed) {
      validationErrors.push(rateLimitCheck.reason);
    }

    // Step 3: Duplicate check
    const duplicateCheck = await this.checkForDuplicates(ratingData);
    if (!duplicateCheck.allowed) {
      validationErrors.push(duplicateCheck.reason);
    }

    // Step 4: Suspicious activity detection
    const suspiciousCheck = this.detectSuspiciousActivity(ratingData);
    if (!suspiciousCheck.allowed) {
      validationErrors.push(suspiciousCheck.reason);
    }

    // Step 5: Business rules validation
    const businessRulesCheck = this.validateBusinessRules(ratingData);
    if (!businessRulesCheck.allowed) {
      validationErrors.push(...businessRulesCheck.reasons);
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
      metadata: {
        formatValidation,
        rateLimitCheck,
        duplicateCheck,
        suspiciousCheck,
        businessRulesCheck
      }
    };
  }

  validateDataFormat(data) {
    const errors = [];

    // Validate rating value
    if (!this.validateField(data.rating, this.validationRules.rating)) {
      errors.push('Avaliação deve ser um número inteiro entre 1 e 5');
    }

    // Validate restaurant ID
    if (!this.validateField(data.restaurantId, this.validationRules.restaurantId)) {
      errors.push('ID do restaurante é inválido');
    }

    // Validate user fingerprint
    if (!this.validateField(data.userFingerprint, this.validationRules.userFingerprint)) {
      errors.push('Identificação do usuário é inválida');
    }

    // Validate timestamp
    if (!this.validateField(data.timestamp, this.validationRules.timestamp)) {
      errors.push('Timestamp da avaliação é inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateField(value, rules) {
    if (rules.required && (value === undefined || value === null || value === '')) {
      return false;
    }

    if (value === undefined || value === null || value === '') {
      return true; // Optional field
    }

    // Type validation
    if (rules.type === 'integer') {
      if (!Number.isInteger(Number(value))) return false;
      if (rules.min !== undefined && Number(value) < rules.min) return false;
      if (rules.max !== undefined && Number(value) > rules.max) return false;
    }

    if (rules.type === 'string') {
      if (typeof value !== 'string') return false;
      if (rules.minLength && value.length < rules.minLength) return false;
      if (rules.pattern && !rules.pattern.test(value)) return false;
    }

    return true;
  }

  async checkRateLimits(ratingData) {
    const now = Date.now();
    const userKey = ratingData.userFingerprint;
    const globalKey = 'global';

    // Check user-specific rate limit
    const userLimit = this.rateLimits.get(userKey) || {
      count: 0,
      resetTime: now + this.suspiciousPatterns.rapidFire.timeframe,
      blocked: false,
      blockUntil: 0
    };

    // Check global rate limit
    const globalLimit = this.rateLimits.get(globalKey) || {
      count: 0,
      resetTime: now + this.suspiciousPatterns.rapidFire.timeframe,
      blocked: false,
      blockUntil: 0
    };

    // Reset counters if timeframe expired
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + this.suspiciousPatterns.rapidFire.timeframe;
    }

    if (now > globalLimit.resetTime) {
      globalLimit.count = 0;
      globalLimit.resetTime = now + this.suspiciousPatterns.rapidFire.timeframe;
    }

    // Check if user is blocked
    if (userLimit.blocked && now < userLimit.blockUntil) {
      return {
        allowed: false,
        reason: `Você está temporariamente bloqueado de enviar avaliações. Tente novamente em ${Math.ceil((userLimit.blockUntil - now) / 1000)} segundos.`
      };
    }

    // Check if global is blocked
    if (globalLimit.blocked && now < globalLimit.blockUntil) {
      return {
        allowed: false,
        reason: 'O sistema está temporariamente sobrecarregado. Tente novamente em alguns minutos.'
      };
    }

    // Check rate limits
    if (userLimit.count >= this.suspiciousPatterns.rapidFire.threshold) {
      userLimit.blocked = true;
      userLimit.blockUntil = now + this.suspiciousPatterns.rapidFire.blockDuration;
      this.rateLimits.set(userKey, userLimit);

      return {
        allowed: false,
        reason: `Muitas avaliações enviadas em curto período. Aguarde ${Math.ceil(this.suspiciousPatterns.rapidFire.blockDuration / 1000)} segundos antes de tentar novamente.`
      };
    }

    if (globalLimit.count >= this.suspiciousPatterns.rapidFire.threshold * 10) {
      globalLimit.blocked = true;
      globalLimit.blockUntil = now + this.suspiciousPatterns.rapidFire.blockDuration;
      this.rateLimits.set(globalKey, globalLimit);

      return {
        allowed: false,
        reason: 'O sistema está recebendo muitas avaliações. Tente novamente mais tarde.'
      };
    }

    // Increment counters
    userLimit.count++;
    globalLimit.count++;

    this.rateLimits.set(userKey, userLimit);
    this.rateLimits.set(globalKey, globalLimit);

    return {
      allowed: true
    };
  }

  async checkForDuplicates(ratingData) {
    try {
      // Check for existing rating from same user
      const existingRating = await this.firebaseService.getUserRating(
        ratingData.restaurantId,
        ratingData.userFingerprint
      );

      if (existingRating) {
        // Check if enough time has passed since last rating
        const lastRatingTime = new Date(existingRating.timestamp).getTime();
        const currentTime = new Date(ratingData.timestamp).getTime();
        const timeDiff = currentTime - lastRatingTime;

        const minTimeBetweenRatings = 24 * 60 * 60 * 1000; // 24 hours

        if (timeDiff < minTimeBetweenRatings) {
          return {
            allowed: false,
            reason: `Você já avaliou este restaurante recentemente. Aguarde ${Math.ceil((minTimeBetweenRatings - timeDiff) / (1000 * 60))} minutos antes de enviar uma nova avaliação.`
          };
        }

        // Allow updating existing rating
        return {
          allowed: true,
          isUpdate: true,
          existingRatingId: existingRating.id
        };
      }

      return {
        allowed: true
      };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // If we can't check, allow the rating but log the error
      this.logSecurityEvent('duplicate_check_error', {
        error: error.message,
        ratingData
      });

      return {
        allowed: true,
        warning: 'Não foi possível verificar avaliações duplicadas'
      };
    }
  }

  detectSuspiciousActivity(ratingData) {
    // Check user agent for suspicious patterns
    const userAgent = navigator.userAgent;
    for (const pattern of this.suspiciousPatterns.suspiciousUserAgent) {
      if (pattern.test(userAgent)) {
        this.logSecurityEvent('suspicious_user_agent', {
          userAgent,
          pattern: pattern.toString()
        });

        return {
          allowed: false,
          reason: 'Acesso detectado como automatizado. Por favor, use um navegador normal.'
        };
      }
    }

    // Check for extremely rapid submissions (client-side detection)
    const submissionTime = Date.now();
    const lastSubmissionTime = this.lastSubmissionTime || 0;
    const timeSinceLastSubmission = submissionTime - lastSubmissionTime;

    if (timeSinceLastSubmission < 1000) { // Less than 1 second
      this.logSecurityEvent('rapid_submission_detected', {
        timeSinceLastSubmission,
        ratingData
      });

      return {
        allowed: false,
        reason: 'Envio muito rápido detectado. Por favor, aguarde um momento antes de tentar novamente.'
      };
    }

    this.lastSubmissionTime = submissionTime;

    // Check for unusual rating patterns
    if (this.detectUnusualRatingPattern(ratingData)) {
      this.logSecurityEvent('unusual_rating_pattern', {
        ratingData
      });

      return {
        allowed: false,
        reason: 'Padrão de avaliação incomum detectado.'
      };
    }

    return {
      allowed: true
    };
  }

  detectUnusualRatingPattern(ratingData) {
    // This could be expanded with more sophisticated pattern detection
    // For now, just checking for obviously suspicious patterns

    // Check if rating is submitted at exactly the same time as restaurant creation
    if (ratingData.timestamp && ratingData.createdAt) {
      const ratingTime = new Date(ratingData.timestamp).getTime();
      const createTime = new Date(ratingData.createdAt).getTime();

      if (Math.abs(ratingTime - createTime) < 1000) {
        return true; // Suspicious: rating submitted immediately after creation
      }
    }

    return false;
  }

  validateBusinessRules(ratingData) {
    const reasons = [];

    // Check if restaurant exists and is active
    // This would be implemented with Firebase query
    // For now, we'll assume it passes if restaurantId is valid format

    // Check rating time is not in the future
    const ratingTime = new Date(ratingData.timestamp).getTime();
    const now = Date.now();

    if (ratingTime > now + 60000) { // Allow 1 minute clock skew
      reasons.push('Data da avaliação não pode estar no futuro');
    }

    // Check rating time is not too far in the past
    const maxPastTime = now - (30 * 24 * 60 * 60 * 1000); // 30 days
    if (ratingTime < maxPastTime) {
      reasons.push('Data da avaliação é muito antiga');
    }

    return {
      allowed: reasons.length === 0,
      reasons
    };
  }

  async logSecurityEvent(eventType, data) {
    try {
      await this.firebaseService.logSecurityEvent({
        eventType,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        data
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  // Clear rate limits (for testing or admin purposes)
  clearRateLimits(userFingerprint = null) {
    if (userFingerprint) {
      this.rateLimits.delete(userFingerprint);
    } else {
      this.rateLimits.clear();
    }
  }

  // Get current rate limit status
  getRateLimitStatus(userFingerprint) {
    const userLimit = this.rateLimits.get(userFingerprint);
    const globalLimit = this.rateLimits.get('global');

    return {
      user: userLimit,
      global: globalLimit
    };
  }
}

// Export for use in other components
window.RatingValidationService = RatingValidationService;
```

### Enhanced Firebase Service with Validation
```javascript
// services/FirebaseService.js (enhanced)
class FirebaseService {
  constructor() {
    this.db = firebase.firestore();
    this.validationService = new RatingValidationService(this);
  }

  async submitRating(ratingData) {
    try {
      // Validate rating before submission
      const validation = await this.validationService.validateRating(ratingData);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Check if this is an update or new rating
      const duplicateCheck = validation.metadata.duplicateCheck;

      if (duplicateCheck.isUpdate && duplicateCheck.existingRatingId) {
        // Update existing rating
        return await this.updateRating(duplicateCheck.existingRatingId, ratingData);
      } else {
        // Create new rating
        return await this.createRating(ratingData);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  async createRating(ratingData) {
    const ratingRef = this.db.collection('ratings').doc();
    const ratingId = ratingRef.id;

    const ratingDocument = {
      id: ratingId,
      restaurantId: ratingData.restaurantId,
      rating: ratingData.rating,
      userFingerprint: ratingData.userFingerprint,
      userAgent: navigator.userAgent,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString(),
      validated: true,
      validationMetadata: {
        clientValidation: true,
        serverValidation: false // Will be set by Firebase Security Rules
      }
    };

    await ratingRef.set(ratingDocument);

    // Update restaurant rating
    await this.updateRestaurantRating(ratingData.restaurantId);

    return {
      success: true,
      ratingId,
      isUpdate: false
    };
  }

  async updateRating(ratingId, ratingData) {
    const ratingRef = this.db.collection('ratings').doc(ratingId);

    await ratingRef.update({
      rating: ratingData.rating,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: new Date().toISOString()
    });

    // Update restaurant rating
    await this.updateRestaurantRating(ratingData.restaurantId);

    return {
      success: true,
      ratingId,
      isUpdate: true
    };
  }

  async updateRestaurantRating(restaurantId) {
    try {
      // Get all ratings for this restaurant
      const ratingsSnapshot = await this.db
        .collection('ratings')
        .where('restaurantId', '==', restaurantId)
        .get();

      const ratings = ratingsSnapshot.docs.map(doc => doc.data());

      if (ratings.length === 0) {
        return;
      }

      // Calculate average rating
      const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
      const averageRating = totalRating / ratings.length;

      // Update restaurant document
      const restaurantRef = this.db.collection('restaurants').doc(restaurantId);
      await restaurantRef.update({
        averageQuality: averageRating,
        totalRatings: ratings.length,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating restaurant rating:', error);
    }
  }

  async getUserRating(restaurantId, userFingerprint) {
    try {
      const snapshot = await this.db
        .collection('ratings')
        .where('restaurantId', '==', restaurantId)
        .where('userFingerprint', '==', userFingerprint)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  }

  async logSecurityEvent(eventData) {
    try {
      await this.db.collection('security_logs').add({
        ...eventData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }
}
```

### Firebase Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Ratings collection
    match /ratings/{ratingId} {
      allow create: if (
        // User must be authenticated (if using Firebase Auth)
        // request.auth != null &&

        // Rating must be between 1 and 5
        request.resource.data.rating >= 1 &&
        request.resource.data.rating <= 5 &&

        // Required fields must be present
        request.resource.data.restaurantId is string &&
        request.resource.data.restaurantId.size() > 0 &&
        request.resource.data.userFingerprint is string &&
        request.resource.data.userFingerprint.size() > 10 &&

        // Timestamp must be reasonable
        request.resource.data.timestamp is timestamp &&
        request.resource.data.timestamp <= request.time &&
        request.resource.data.timestamp >= request.time - duration(30, 'd')
      );

      allow update: if (
        // User must be authenticated
        // request.auth != null &&

        // Only owner can update
        resource.data.userFingerprint == request.resource.data.userFingerprint &&

        // Only rating can be updated
        request.resource.data.rating == resource.data.rating ||
        (
          request.resource.data.rating >= 1 &&
          request.resource.data.rating <= 5
        ) &&

        // Cannot update restaurantId or fingerprint
        request.resource.data.restaurantId == resource.data.restaurantId &&
        request.resource.data.userFingerprint == resource.data.userFingerprint
      );

      allow read: if true; // Ratings are publicly readable
    }

    // Restaurants collection
    match /restaurants/{restaurantId} {
      allow read: if true; // Restaurants are publicly readable

      allow write: if (
        // Only allow updates to rating fields by system
        request.resource.data.averageQuality is number &&
        request.resource.data.totalRatings is number &&
        request.resource.data.averageQuality >= 1 &&
        request.resource.data.averageQuality <= 5 &&
        request.resource.data.totalRatings >= 0
      );
    }

    // Security logs (admin only)
    match /security_logs/{logId} {
      allow read, write: if false; // No direct access
    }
  }
}
```

### Testing
**Testing Checklist:**
- Data format validation works correctly
- Rate limiting prevents rapid submissions
- Duplicate detection works for same user
- Suspicious activity detection blocks bots
- Business rules validation prevents invalid submissions
- Security events are logged correctly
- Firebase security rules are enforced
- Rating updates work correctly
- Restaurant ratings are recalculated after new submissions
- Error messages are clear and helpful
- System works offline and syncs when online

### Dependencies
- Story 3.1: User Identification System for fingerprint generation
- Story 3.2: Rating Form & Interface for client-side validation
- Story 0.2: Firebase Service for data storage
- Story 0.3: Firebase Security Rules for server-side validation

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-30 | 1.0 | Initial story creation with BMad framework | Dev Agent |

## Dev Agent Record

### Agent Model Used
*To be populated by development agent*

### Debug Log References
*To be populated by development agent*

### Completion Notes List
*To be populated by development agent*

### File List
*To be populated by development agent*

## QA Results
*To be populated by QA agent*