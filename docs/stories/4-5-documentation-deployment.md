# Story 4.5: Documentation & Deployment

## Status
Draft

## Story
**As a** stakeholder,
**I want** comprehensive documentation and deployment setup,
**so that** the application can be maintained, deployed, and scaled effectively.

## Acceptance Criteria
1. Complete user documentation must be created for all features
2. Developer documentation for code architecture and setup must be provided
3. Automated deployment pipeline must be configured
4. Production environment must be properly set up
5. Monitoring and logging must be implemented in production
6. Security best practices must be implemented for deployment
7. Backup and recovery procedures must be established
8. Scalability and performance optimizations must be configured

## Tasks / Subtasks
- [ ] Task 4.5.1: Complete user documentation creation (AC: 1)
  - [ ] Subtask 4.5.1.1: Create comprehensive user guide with step-by-step instructions
  - [ ] Subtask 4.5.1.2: Document restaurant discovery and filtering features
  - [ ] Subtask 4.5.1.3: Document restaurant registration process with screenshots
  - [ ] Subtask 4.5.1.4: Document rating and review system with examples
  - [ ] Subtask 4.5.1.5: Document photo upload and management features
  - [ ] Subtask 4.5.1.6: Create FAQ section addressing common user questions
  - [ ] Subtask 4.5.1.7: Document accessibility features and usage
  - [ ] Subtask 4.5.1.8: Create troubleshooting guide for common user issues

- [ ] Task 4.5.2: Developer documentation creation (AC: 2)
  - [ ] Subtask 4.5.2.1: Create comprehensive README with setup instructions
  - [ ] Subtask 4.5.2.2: Document project architecture and design decisions
  - [ ] Subtask 4.5.2.3: Create API documentation with examples
  - [ ] Subtask 4.5.2.4: Document Firebase configuration and data structure
  - [ ] Subtask 4.5.2.5: Create component documentation with usage examples
  - [ ] Subtask 4.5.2.6: Document testing procedures and frameworks used
  - [ ] Subtask 4.5.2.7: Create contribution guidelines for developers
  - [ ] Subtask 4.5.2.8: Document coding standards and best practices

- [ ] Task 4.5.3: Automated deployment pipeline configuration (AC: 3)
  - [ ] Subtask 4.5.3.1: Setup GitHub Actions or equivalent CI/CD pipeline
  - [ ] Subtask 4.5.3.2: Configure automated testing in deployment pipeline
  - [ ] Subtask 4.5.3.3: Setup build and optimization processes
  - [ ] Subtask 4.5.3.4: Configure staging environment for testing
  - [ ] Subtask 4.5.3.5: Setup automated deployment to production
  - [ ] Subtask 4.5.3.6: Configure rollback mechanisms for failed deployments
  - [ ] Subtask 4.5.3.7: Setup deployment notifications and monitoring
  - [ ] Subtask 4.5.3.8: Test end-to-end deployment pipeline

- [ ] Task 4.5.4: Production environment setup (AC: 4)
  - [ ] Subtask 4.5.4.1: Configure Firebase production project
  - [ ] Subtask 4.5.4.2: Setup production hosting (Vercel, Netlify, or similar)
  - [ ] Subtask 4.5.4.3: Configure custom domain and SSL certificates
  - [ ] Subtask 4.5.4.4: Setup production environment variables
  - [ ] Subtask 4.5.4.5: Configure Firebase security rules for production
  - [ ] Subtask 4.5.4.6: Setup CDN and caching strategies
  - [ ] Subtask 4.5.4.7: Configure backup and disaster recovery
  - [ ] Subtask 4.5.4.8: Test production environment functionality

- [ ] Task 4.5.5: Production monitoring and logging (AC: 5)
  - [ ] Subtask 4.5.5.1: Configure Firebase Performance Monitoring
  - [ ] Subtask 4.5.5.2: Setup Google Analytics for production tracking
  - [ ] Subtask 4.5.5.3: Configure Firebase Crashlytics for error tracking
  - [ ] Subtask 4.5.5.4: Setup custom error logging and monitoring
  - [ ] Subtask 4.5.5.5: Configure performance metrics collection
  - [ ] Subtask 4.5.5.6: Setup alerting for critical issues
  - [ ] Subtask 4.5.5.7: Create monitoring dashboard
  - [ ] Subtask 4.5.5.8: Test monitoring and alerting systems

- [ ] Task 4.5.6: Security best practices implementation (AC: 6)
  - [ ] Subtask 4.5.6.1: Audit and secure Firebase security rules
  - [ ] Subtask 4.5.6.2: Implement rate limiting for API endpoints
  - [ ] Subtask 4.5.6.3: Configure CORS policies for production
  - [ ] Subtask 4.5.6.4: Setup Content Security Policy (CSP) headers
  - [ ] Subtask 4.5.6.5: Implement authentication security best practices
  - [ ] Subtask 4.5.6.6: Configure HTTPS and security headers
  - [ ] Subtask 4.5.6.7: Setup vulnerability scanning and monitoring
  - [ ] Subtask 4.5.6.8: Create security incident response plan

- [ ] Task 4.5.7: Backup and recovery procedures (AC: 7)
  - [ ] Subtask 4.5.7.1: Configure automated Firebase data backups
  - [ ] Subtask 4.5.7.2: Setup version control and release management
  - [ ] Subtask 4.5.7.3: Create disaster recovery documentation
  - [ ] Subtask 4.5.7.4: Test backup and restore procedures
  - [ ] Subtask 4.5.7.5: Configure data retention policies
  - [ ] Subtask 4.5.7.6: Setup monitoring for backup processes
  - [ ] Subtask 4.5.7.7: Create emergency response procedures
  - [ ] Subtask 4.5.7.8: Document recovery time objectives (RTO/RPO)

- [ ] Task 4.5.8: Scalability and performance configuration (AC: 8)
  - [ ] Subtask 4.5.8.1: Optimize Firebase for high-traffic scenarios
  - [ ] Subtask 4.5.8.2: Configure CDN and edge caching
  - [ ] Subtask 4.5.8.3: Implement lazy loading and code splitting
  - [ ] Subtask 4.5.8.4: Optimize images and static assets
  - [ ] Subtask 4.5.8.5: Configure database indexing for performance
  - [ ] Subtask 4.5.8.6: Setup load testing and performance benchmarks
  - [ ] Subtask 4.5.8.7: Configure auto-scaling if applicable
  - [ ] Subtask 4.5.8.8: Monitor and optimize Core Web Vitals

## Dev Notes

### Comprehensive Documentation Structure

```markdown
# Esplanada Eats - Complete Documentation

## Table of Contents

### User Documentation
1. [Getting Started Guide](#user-guide)
2. [Features Overview](#features)
3. [Restaurant Discovery](#restaurant-discovery)
4. [Restaurant Registration](#restaurant-registration)
5. [Rating and Reviews](#ratings)
6. [Photo Management](#photos)
7. [Accessibility](#accessibility)
8. [FAQ](#faq)
9. [Troubleshooting](#troubleshooting)

### Developer Documentation
1. [Project Overview](#overview)
2. [Architecture](#architecture)
3. [Setup and Installation](#setup)
4. [API Documentation](#api)
5. [Firebase Configuration](#firebase)
6. [Components](#components)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [Code Standards](#standards)

### Operations Documentation
1. [Deployment Guide](#deployment-guide)
2. [Monitoring](#monitoring)
3. [Security](#security)
4. [Backup and Recovery](#backup)
5. [Performance Optimization](#performance)
6. [Incident Response](#incident-response)
```

### User Documentation Examples

```markdown
# User Guide - Restaurant Discovery

## How to Find Restaurants

### Step 1: Access the Restaurant List
1. Open the Esplanada Eats application
2. The main page displays all available restaurants
3. Use the search bar to find specific restaurants

### Step 2: Filter Restaurants
1. Click on the "Filter" button
2. Select your preferred criteria:
   - Cuisine type
   - Price range
   - Location
   - Rating minimum
3. Click "Apply Filters"

### Step 3: View Restaurant Details
1. Click on any restaurant card
2. View detailed information including:
   - Photos and menu
   - User ratings and reviews
   - Operating hours
   - Contact information

### Step 4: Rate a Restaurant
1. Click the "Rate Restaurant" button
2. Select your rating (1-5 stars)
3. Add a written review (optional)
4. Upload photos (optional)
5. Click "Submit Rating"

## Frequently Asked Questions

**Q: How do I report an issue with a restaurant listing?**
A: Use the bug report button in the bottom-right corner or contact support.

**Q: Can I edit my rating after submitting?**
A: Yes, you can edit your rating within 24 hours of submission.

## Troubleshooting

**Problem: Restaurant photos are not loading**
**Solution:**
1. Check your internet connection
2. Refresh the page
3. Try accessing the site in a different browser
4. If the issue persists, contact support
```

### Developer Documentation Examples

```markdown
# API Documentation

## Authentication

The application uses Firebase Authentication for user management.

### Get Current User
```javascript
import { auth } from './firebase-config';

const currentUser = auth.currentUser;
if (currentUser) {
  console.log('User ID:', currentUser.uid);
}
```

## Restaurant API

### Get Restaurants
```javascript
import { getDocs, collection, query, orderBy } from 'firebase/firestore';

async function getRestaurants() {
  const q = query(
    collection(db, 'restaurants'),
    orderBy('name', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Add Restaurant
```javascript
import { addDoc, collection } from 'firebase/firestore';

async function addRestaurant(restaurantData) {
  try {
    const docRef = await addDoc(collection(db, 'restaurants'), {
      ...restaurantData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding restaurant:', error);
    throw error;
  }
}
```

## Rating API

### Submit Rating
```javascript
import { addDoc, collection } from 'firebase/firestore';

async function submitRating(ratingData) {
  try {
    const docRef = await addDoc(collection(db, 'ratings'), {
      ...ratingData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
}
```
```

### Deployment Pipeline Configuration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run linting
        run: npm run lint

      - name: Build application
        run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for staging
        run: npm run build:staging

      - name: Deploy to staging
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}'
          channelId: live
          projectId: esplanada-eats-staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build:production

      - name: Deploy to production
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}'
          channelId: live
          projectId: esplanada-eats-prod

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Firebase Production Configuration

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|gif|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=86400"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ],
    "redirects": [
      {
        "source": "/",
        "destination": "/index.html",
        "type": 301
      },
      {
        "source": "/restaurants",
        "destination": "/index.html",
        "type": 301
      },
      {
        "source": "/rate",
        "destination": "/index.html",
        "type": 301
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Production Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restaurants collection
    match /restaurants/{restaurantId} {
      allow read: if true;
      allow create: if request.auth != null &&
        request.auth.token.email_verified == true &&
        request.resource.data.keys().hasAll(['name', 'address', 'cuisine']);
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.ownerId;
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.ownerId;
    }

    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if request.auth != null &&
        request.auth.token.email_verified == true &&
        request.resource.data.rating >= 1 &&
        request.resource.data.rating <= 5 &&
        request.resource.data.keys().hasAll(['restaurantId', 'rating', 'userId']);
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.userId &&
        request.time < resource.data.createdAt + 86400000; // 24 hours
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

### Monitoring and Analytics Setup

```javascript
// js/monitoring.js
import { initializeApp } from 'firebase/app';
import { getPerformance } from 'firebase/performance';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

class ProductionMonitoring {
  constructor() {
    this.app = null;
    this.analytics = null;
    this.performance = null;
    this.auth = null;

    this.initialize();
  }

  async initialize() {
    // Initialize Firebase
    const firebaseConfig = {
      apiKey: "your-production-api-key",
      authDomain: "esplanada-eats-prod.firebaseapp.com",
      projectId: "esplanada-eats-prod",
      storageBucket: "esplanada-eats-prod.appspot.com",
      messagingSenderId: "123456789",
      appId: "your-production-app-id",
      measurementId: "your-measurement-id"
    };

    this.app = initializeApp(firebaseConfig);
    this.analytics = getAnalytics(this.app);
    this.performance = getPerformance(this.app);
    this.auth = getAuth(this.app);

    // Setup monitoring
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupUserAnalytics();
  }

  setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const metrics = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0
        };

        this.trackPerformanceMetrics(metrics);
      });
    }
  }

  setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
    });
  }

  setupUserAnalytics() {
    // Track user behavior
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a, .restaurant-card');
      if (target) {
        this.trackUserInteraction('click', {
          element: target.tagName.toLowerCase(),
          id: target.id,
          class: target.className,
          text: target.textContent?.trim().substring(0, 50)
        });
      }
    });

    // Track page views
    this.trackPageView(window.location.pathname);
  }

  trackPerformanceMetrics(metrics) {
    // Send to Firebase Performance Monitoring
    if (this.performance) {
      const trace = this.performance.trace('page_load');
      trace.putMetric('load_time', metrics.loadTime);
      trace.putMetric('dom_content_loaded', metrics.domContentLoaded);
      trace.putMetric('first_paint', metrics.firstPaint);
      trace.putMetric('first_contentful_paint', metrics.firstContentfulPaint);
      trace.stop();
    }

    // Send to Google Analytics
    if (this.analytics) {
      // GA4 custom event for performance
      this.analytics.logEvent('performance_metrics', metrics);
    }
  }

  trackError(type, error) {
    // Send to Google Analytics
    if (this.analytics) {
      this.analytics.logEvent('error', {
        type: type,
        message: error.message,
        filename: error.filename
      });
    }

    // Send to error tracking service
    this.sendToErrorTrackingService({
      type: type,
      error: error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  trackUserInteraction(action, data) {
    if (this.analytics) {
      this.analytics.logEvent('user_interaction', {
        action: action,
        ...data
      });
    }
  }

  trackPageView(path) {
    if (this.analytics) {
      this.analytics.logEvent('page_view', {
        page_path: path
      });
    }
  }

  async sendToErrorTrackingService(errorData) {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });

      if (!response.ok) {
        console.warn('Failed to send error to tracking service');
      }
    } catch (error) {
      console.warn('Error sending error to tracking service:', error);
    }
  }
}

// Initialize monitoring in production
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  window.productionMonitoring = new ProductionMonitoring();
}
```

### Security Configuration

```javascript
// js/security.js
class SecurityManager {
  constructor() {
    this.setupSecurityHeaders();
    this.setupContentSecurityPolicy();
    this.setupXSSProtection();
    this.setupCSRFProtection();
  }

  setupSecurityHeaders() {
    // These would typically be set at the server level
    // but we can add client-side security measures
    this.preventClickjacking();
    this.setupSecureCookies();
  }

  preventClickjacking() {
    // Prevent clickjacking attacks
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  }

  setupContentSecurityPolicy() {
    // Client-side CSP violation reporting
    if ('SecurityPolicyViolationEvent' in window) {
      document.addEventListener('securitypolicyviolation', (event) => {
        this.reportSecurityViolation(event);
      });
    }
  }

  setupXSSProtection() {
    // Sanitize user inputs
    this.setupInputSanitization();
    this.setupOutputEncoding();
  }

  setupInputSanitization() {
    // Sanitize form inputs before processing
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const inputs = form.querySelectorAll('input, textarea');

      inputs.forEach(input => {
        if (input.type !== 'password') {
          input.value = this.sanitizeInput(input.value);
        }
      });
    });
  }

  sanitizeInput(input) {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  setupOutputEncoding() {
    // Ensure all dynamic content is properly encoded
    this.setupSafeHTMLRendering();
  }

  setupSafeHTMLRendering() {
    // Override innerHTML usage with safe alternatives
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      if (name === 'href' || name === 'src') {
        value = this.sanitizeURL(value);
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  sanitizeURL(url) {
    try {
      const parsed = new URL(url, window.location.origin);
      // Only allow http, https, and relative URLs
      if (['http:', 'https:'].includes(parsed.protocol) || !parsed.protocol) {
        return parsed.toString();
      }
    } catch (e) {
      // Invalid URL
    }
    return '#';
  }

  setupCSRFProtection() {
    // Generate and validate CSRF tokens for API requests
    this.generateCSRFToken();
  }

  generateCSRFToken() {
    const token = this.generateRandomToken();
    localStorage.setItem('csrf_token', token);

    // Add token to all form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'csrf_token';
      tokenInput.value = token;
      form.appendChild(tokenInput);
    });
  }

  generateRandomToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  reportSecurityViolation(event) {
    // Report CSP violations to monitoring service
    const violation = {
      blockedURI: event.blockedURI,
      documentURI: event.documentURI,
      effectiveDirective: event.effectiveDirective,
      originalPolicy: event.originalPolicy,
      referrer: event.referrer,
      sourceFile: event.sourceFile,
      timeStamp: event.timeStamp,
      userAgent: navigator.userAgent
    };

    this.sendSecurityViolation(violation);
  }

  async sendSecurityViolation(violation) {
    try {
      const response = await fetch('/api/security-violations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(violation)
      });

      if (!response.ok) {
        console.warn('Failed to report security violation');
      }
    } catch (error) {
      console.warn('Error reporting security violation:', error);
    }
  }
}

// Initialize security manager
window.securityManager = new SecurityManager();
```

### Backup and Recovery Scripts

```bash
#!/bin/bash
# scripts/backup-firebase.sh

# Firebase Backup Script
# Usage: ./backup-firebase.sh [staging|production]

ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups/${ENVIRONMENT}"
PROJECT_ID="esplanada-eats-${ENVIRONMENT}"

echo "Starting Firebase backup for ${ENVIRONMENT} environment..."

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Export Firestore data
echo "Exporting Firestore data..."
firebase firestore:export --project ${PROJECT_ID} ${BACKUP_DIR}/firestore_${TIMESTAMP}

# Export Storage files
echo "Exporting Storage files..."
gsutil -m rsync -r gs://${PROJECT_ID}.appspot.com ${BACKUP_DIR}/storage_${TIMESTAMP}

# Compress backups
echo "Compressing backups..."
tar -czf ${BACKUP_DIR}/firebase_backup_${TIMESTAMP}.tar.gz -C ${BACKUP_DIR} firestore_${TIMESTAMP} storage_${TIMESTAMP}

# Clean up uncompressed directories
rm -rf ${BACKUP_DIR}/firestore_${TIMESTAMP}
rm -rf ${BACKUP_DIR}/storage_${TIMESTAMP}

# Keep only last 30 backups
cd ${BACKUP_DIR}
ls -t firebase_backup_*.tar.gz | tail -n +31 | xargs -r rm

echo "Backup completed: firebase_backup_${TIMESTAMP}.tar.gz"
```

### Performance Optimization

```javascript
// js/performance-optimizer.js
class PerformanceOptimizer {
  constructor() {
    this.setupLazyLoading();
    this.setupCodeSplitting();
    this.setupImageOptimization();
    this.setupCaching();
    this.setupServiceWorker();
  }

  setupLazyLoading() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  setupCodeSplitting() {
    // Dynamic import for non-critical modules
    this.loadModulesOnDemand();
  }

  loadModulesOnDemand() {
    // Load rating module only when needed
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-load-module="rating"]')) {
        import('./modules/rating.js').then(module => {
          module.initRatingSystem();
        });
      }

      if (e.target.closest('[data-load-module="restaurant-form"]')) {
        import('./modules/restaurant-form.js').then(module => {
          module.initRestaurantForm();
        });
      }
    });
  }

  setupImageOptimization() {
    // Optimize image loading
    this.setupResponsiveImages();
    this.setupWebPSupport();
  }

  setupResponsiveImages() {
    // Create responsive image elements
    document.querySelectorAll('img[data-srcset]').forEach(img => {
      const srcset = img.dataset.srcset;
      const sources = srcset.split(',').map(source => {
        const [url, descriptor] = source.trim().split(' ');
        return `<source srcset="${url}" media="(max-width: ${descriptor.replace('w', 'px')})">`;
      }).join('');

      const picture = document.createElement('picture');
      picture.innerHTML = sources + `<img src="${img.dataset.src}" alt="${img.alt}">`;
      img.parentNode.replaceChild(picture, img);
    });
  }

  setupWebPSupport() {
    // Use WebP if supported
    if (this.supportsWebP()) {
      document.querySelectorAll('img[data-webp]').forEach(img => {
        img.src = img.dataset.webp;
      });
    }
  }

  supportsWebP() {
    return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  setupCaching() {
    // Setup application cache strategies
    this.setupApplicationCache();
  }

  setupApplicationCache() {
    // Cache critical resources
    const criticalResources = [
      '/styles/main.css',
      '/js/main.js',
      '/js/firebase-config.js',
      '/images/logo.png'
    ];

    criticalResources.forEach(resource => {
      this.cacheResource(resource);
    });
  }

  cacheResource(url) {
    if ('caches' in window) {
      caches.open('esplanada-eats-v1').then(cache => {
        cache.add(url);
      });
    }
  }

  setupServiceWorker() {
    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('ServiceWorker registration successful');
      }).catch(error => {
        console.log('ServiceWorker registration failed');
      });
    }
  }
}

// Initialize performance optimizer
window.performanceOptimizer = new PerformanceOptimizer();
```

### Dependencies
- All previous stories for comprehensive documentation
- Story 4.1: Responsive Design Refinement (for deployment requirements)
- Story 4.3: Browser Compatibility Testing (for deployment testing)
- Story 4.4: Analytics & Monitoring (for production monitoring)

### Testing
- Complete user documentation is accurate and comprehensive
- Developer documentation covers all aspects of the system
- Automated deployment pipeline functions correctly
- Production environment is fully configured and secure
- Monitoring and alerting systems are operational
- Security measures are implemented and tested
- Backup and recovery procedures work correctly
- Application performs well under load in production

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