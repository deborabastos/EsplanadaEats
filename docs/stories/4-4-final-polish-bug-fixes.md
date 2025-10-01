# Story 4.4: Final Polish & Bug Fixes

## Status
Draft

## Story
**As a** user,
**I want** a polished, bug-free experience,
**so that** I can trust and enjoy using the application.

## Acceptance Criteria
1. Comprehensive bug fixing must be implemented across all features
2. UI polish including animations, transitions, and micro-interactions must be completed
3. Final accessibility improvements must be implemented
4. Error handling refinement for edge cases must be completed
5. Performance optimization final pass must be implemented

## Tasks / Subtasks
- [ ] Task 4.4.1: Comprehensive bug fixing across all features (AC: 1)
  - [ ] Subtask 4.4.1.1: Identify and fix all high-priority bugs in restaurant discovery features
  - [ ] Subtask 4.4.1.2: Identify and fix all high-priority bugs in restaurant registration system
  - [ ] Subtask 4.4.1.3: Identify and fix all high-priority bugs in user rating system
  - [ ] Subtask 4.4.1.4: Identify and fix all high-priority bugs in image upload functionality
  - [ ] Subtask 4.4.1.5: Identify and fix all high-priority bugs in modal interactions
  - [ ] Subtask 4.4.1.6: Identify and fix all high-priority bugs in form validation
  - [ ] Subtask 4.4.1.7: Identify and fix all high-priority bugs in responsive design
  - [ ] Subtask 4.4.1.8: Identify and fix all high-priority bugs in Firebase integration

- [ ] Task 4.4.2: UI polish implementation (AC: 2)
  - [ ] Subtask 4.4.2.1: Implement smooth transitions for all interactive elements
  - [ ] Subtask 4.4.2.2: Add subtle hover effects to buttons and cards
  - [ ] Subtask 4.4.2.3: Create loading animations for async operations
  - [ ] Subtask 4.4.2.4: Add success/error animations for form submissions
  - [ ] Subtask 4.4.2.5: Implement smooth modal open/close animations
  - [ ] Subtask 4.4.2.6: Add subtle parallax effects to image galleries
  - [ ] Subtask 4.4.2.7: Create progress indicators for multi-step processes
  - [ ] Subtask 4.4.2.8: Implement keyboard navigation visual indicators

- [ ] Task 4.4.3: Final accessibility improvements (AC: 3)
  - [ ] Subtask 4.4.3.1: Conduct comprehensive accessibility audit using WCAG guidelines
  - [ ] Subtask 4.4.3.2: Fix all accessibility issues identified in testing
  - [ ] Subtask 4.4.3.3: Improve keyboard navigation throughout the application
  - [ ] Subtask 4.4.3.4: Add ARIA labels and descriptions to all interactive elements
  - [ ] Subtask 4.4.3.5: Ensure proper focus management in modals and forms
  - [ ] Subtask 4.4.3.6: Implement screen reader compatibility improvements
  - [ ] Subtask 4.4.3.7: Add high contrast mode support
  - [ ] Subtask 4.4.3.8: Improve color contrast ratios for better readability

- [ ] Task 4.4.4: Error handling refinement (AC: 4)
  - [ ] Subtask 4.4.4.1: Implement comprehensive error handling for network failures
  - [ ] Subtask 4.4.4.2: Add graceful handling of Firebase quota limits
  - [ ] Subtask 4.4.4.3: Improve error messages for better user understanding
  - [ ] Subtask 4.4.4.4: Add retry mechanisms for failed operations
  - [ ] Subtask 4.4.4.5: Implement offline mode error handling
  - [ ] Subtask 4.4.4.6: Add error recovery options for users
  - [ ] Subtask 4.4.4.7: Create error logging for debugging purposes
  - [ ] Subtask 4.4.4.8: Implement user-friendly error recovery flows

- [ ] Task 4.4.5: Performance optimization final pass (AC: 5)
  - [ ] Subtask 4.4.5.1: Optimize image loading and caching strategies
  - [ ] Subtask 4.4.5.2: Implement code splitting for better bundle management
  - [ ] Subtask 4.4.5.3: Optimize Firebase queries for better performance
  - [ ] Subtask 4.4.5.4: Add performance monitoring and analytics
  - [ ] Subtask 4.4.5.5: Implement lazy loading for non-critical components
  - [ ] Subtask 4.4.5.6: Optimize CSS and JavaScript bundle sizes
  - [ ] Subtask 4.4.5.7: Add service worker for offline support
  - [ ] Subtask 4.4.5.8: Implement caching strategies for better performance

## Dev Notes

### Bug Tracking and Management System

```javascript
// js/utils/bug-tracker.js
export class BugTracker {
    constructor() {
        this.bugs = new Map();
        this.severityLevels = {
            critical: 5,
            high: 4,
            medium: 3,
            low: 2,
            cosmetic: 1
        };
        this.categories = {
            ui: 'User Interface',
            functionality: 'Functionality',
            performance: 'Performance',
            accessibility: 'Accessibility',
            compatibility: 'Compatibility',
            security: 'Security'
        };
        this.statuses = {
            open: 'Open',
            in_progress: 'In Progress',
            resolved: 'Resolved',
            verified: 'Verified',
            closed: 'Closed'
        };

        this.initialize();
    }

    initialize() {
        // Load existing bugs from localStorage
        this.loadBugs();

        // Setup automatic bug detection
        this.setupAutomaticBugDetection();

        // Setup user bug reporting
        this.setupUserBugReporting();

        // Setup bug monitoring
        this.setupBugMonitoring();
    }

    loadBugs() {
        try {
            const stored = localStorage.getItem('esplanada-eats-bugs');
            if (stored) {
                const bugs = JSON.parse(stored);
                bugs.forEach(bug => {
                    this.bugs.set(bug.id, bug);
                });
            }
        } catch (error) {
            console.error('Error loading bugs:', error);
        }
    }

    saveBugs() {
        try {
            const bugs = Array.from(this.bugs.values());
            localStorage.setItem('esplanada-eats-bugs', JSON.stringify(bugs));
        } catch (error) {
            console.error('Error saving bugs:', error);
        }
    }

    setupAutomaticBugDetection() {
        // Monitor JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleJavaScriptError(event);
        });

        // Monitor unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event);
        });

        // Monitor resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT') {
                this.handleResourceError(event);
            }
        }, true);

        // Monitor Firebase errors
        this.setupFirebaseErrorMonitoring();
    }

    setupFirebaseErrorMonitoring() {
        if (typeof firebase !== 'undefined') {
            // Monitor Firebase authentication errors
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    // Monitor user-specific errors
                    this.monitorUserOperations(user);
                }
            });

            // Monitor Firestore errors
            firebase.firestore().enablePersistence()
                .catch((error) => {
                    this.logBug('firebase-persistence', {
                        title: 'Firebase Persistence Error',
                        description: 'Failed to enable Firebase persistence',
                        severity: 'medium',
                        category: 'functionality',
                        error: error.message,
                        stack: error.stack
                    });
                });
        }
    }

    monitorUserOperations(user) {
        // Monitor user-specific operations for errors
        const unsubscribe = firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .onSnapshot((doc) => {
                // Monitor user document changes
            }, (error) => {
                this.logBug('firebase-user-ops', {
                    title: 'User Operations Error',
                    description: 'Error monitoring user operations',
                    severity: 'medium',
                    category: 'functionality',
                    error: error.message,
                    stack: error.stack,
                    userId: user.uid
                });
            });

        // Store unsubscribe for cleanup
        this.firebaseUnsubscribe = unsubscribe;
    }

    handleJavaScriptError(event) {
        const error = {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            message: event.message,
            stack: event.error?.stack
        };

        this.logBug('js-error', {
            title: 'JavaScript Error',
            description: error.message,
            severity: 'high',
            category: 'functionality',
            error: error
        });
    }

    handlePromiseRejection(event) {
        const error = {
            message: event.reason?.message || event.reason,
            stack: event.reason?.stack
        };

        this.logBug('promise-rejection', {
            title: 'Unhandled Promise Rejection',
            description: error.message,
            severity: 'high',
            category: 'functionality',
            error: error
        });

        event.preventDefault();
    }

    handleResourceError(event) {
        const error = {
            tagName: event.target.tagName,
            src: event.target.src,
            type: event.target.type
        };

        this.logBug('resource-error', {
            title: 'Resource Loading Error',
            description: `Failed to load ${error.tagName}: ${error.src}`,
            severity: 'medium',
            category: 'functionality',
            error: error
        });
    }

    setupUserBugReporting() {
        // Add bug report button to the UI
        this.addBugReportButton();

        // Setup keyboard shortcut for bug reporting (Ctrl+Shift+B)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'B') {
                this.showBugReportForm();
            }
        });
    }

    addBugReportButton() {
        const button = document.createElement('button');
        button.className = 'bug-report-btn';
        button.innerHTML = '🐛 Report Bug';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #ef4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        button.addEventListener('click', () => {
            this.showBugReportForm();
        });

        document.body.appendChild(button);
    }

    showBugReportForm() {
        const form = document.createElement('div');
        form.className = 'bug-report-form';
        form.innerHTML = `
            <div class="bug-report-overlay">
                <div class="bug-report-content">
                    <h2>Report a Bug</h2>
                    <form id="bug-report-form-element">
                        <div class="form-group">
                            <label for="bug-title">Bug Title *</label>
                            <input type="text" id="bug-title" required>
                        </div>
                        <div class="form-group">
                            <label for="bug-description">Description *</label>
                            <textarea id="bug-description" rows="4" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="bug-severity">Severity</label>
                            <select id="bug-severity">
                                <option value="cosmetic">Cosmetic</option>
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="bug-category">Category</label>
                            <select id="bug-category">
                                <option value="ui">User Interface</option>
                                <option value="functionality" selected>Functionality</option>
                                <option value="performance">Performance</option>
                                <option value="accessibility">Accessibility</option>
                                <option value="compatibility">Compatibility</option>
                                <option value="security">Security</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="bug-steps">Steps to Reproduce</label>
                            <textarea id="bug-steps" rows="3" placeholder="1. Step one&#10;2. Step two&#10;3. Step three"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancel</button>
                            <button type="submit" class="btn-submit">Report Bug</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(form);

        // Setup form submission
        const formElement = form.querySelector('#bug-report-form-element');
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitBugReport(form);
        });

        // Setup cancel button
        const cancelButton = form.querySelector('.btn-cancel');
        cancelButton.addEventListener('click', () => {
            form.remove();
        });

        // Close on overlay click
        const overlay = form.querySelector('.bug-report-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                form.remove();
            }
        });
    }

    submitBugReport(form) {
        const formData = new FormData(form.querySelector('#bug-report-form-element'));
        const bug = {
            id: this.generateBugId(),
            title: formData.get('bug-title') || document.getElementById('bug-title').value,
            description: formData.get('bug-description') || document.getElementById('bug-description').value,
            severity: formData.get('bug-severity') || document.getElementById('bug-severity').value,
            category: formData.get('bug-category') || document.getElementById('bug-category').value,
            steps: formData.get('bug-steps') || document.getElementById('bug-steps').value,
            status: 'open',
            createdAt: new Date().toISOString(),
            createdBy: 'user',
            userAgent: navigator.userAgent,
            url: window.location.href,
            browserInfo: this.getBrowserInfo()
        };

        this.addBug(bug);
        this.showBugReportSuccess();
        form.remove();
    }

    getBrowserInfo() {
        return {
            name: this.getBrowserName(),
            version: this.getBrowserVersion(),
            platform: navigator.platform,
            language: navigator.language
        };
    }

    getBrowserName() {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) return 'Chrome';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) return 'Safari';
        if (userAgent.indexOf('Edg') > -1) return 'Edge';
        return 'Unknown';
    }

    getBrowserVersion() {
        const userAgent = navigator.userAgent;
        const match = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
        return match ? match[2] : 'Unknown';
    }

    showBugReportSuccess() {
        const success = document.createElement('div');
        success.className = 'bug-report-success';
        success.innerHTML = `
            <div class="success-content">
                <h3>Thank You!</h3>
                <p>Your bug report has been submitted successfully. We'll investigate and fix it as soon as possible.</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;

        document.body.appendChild(success);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (success.parentElement) {
                success.remove();
            }
        }, 5000);
    }

    setupBugMonitoring() {
        // Monitor for common UI issues
        this.monitorUIIssues();

        // Monitor for performance issues
        this.monitorPerformanceIssues();

        // Monitor for accessibility issues
        this.monitorAccessibilityIssues();
    }

    monitorUIIssues() {
        // Monitor for broken links
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('error', (e) => {
                this.logBug('broken-link', {
                    title: 'Broken Link',
                    description: `Broken link found: ${link.href}`,
                    severity: 'medium',
                    category: 'ui',
                    element: link.outerHTML
                });
            });
        });

        // Monitor for image loading failures
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('error', (e) => {
                this.logBug('broken-image', {
                    title: 'Broken Image',
                    description: `Failed to load image: ${img.src}`,
                    severity: 'medium',
                    category: 'ui',
                    element: img.outerHTML
                });
            });
        });
    }

    monitorPerformanceIssues() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.checkPageLoadPerformance();
            }, 1000);
        });

        // Monitor long-running operations
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(callback, delay, ...args) {
            if (delay > 5000) {
                console.warn('Long timeout detected:', delay);
            }
            return originalSetTimeout.call(this, callback, delay, ...args);
        };
    }

    checkPageLoadPerformance() {
        if (window.performance) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

            if (loadTime > 5000) {
                this.logBug('slow-page-load', {
                    title: 'Slow Page Load',
                    description: `Page load time: ${loadTime}ms`,
                    severity: 'medium',
                    category: 'performance',
                    metrics: { loadTime }
                });
            }
        }
    }

    monitorAccessibilityIssues() {
        // Check for missing alt attributes on images
        document.querySelectorAll('img:not([alt])').forEach(img => {
            this.logBug('missing-alt', {
                title: 'Missing Alt Attribute',
                description: 'Image missing alt attribute',
                severity: 'medium',
                category: 'accessibility',
                element: img.outerHTML
            });
        });

        // Check for missing labels on form inputs
        document.querySelectorAll('input:not([type="hidden"]):not([id]), select:not([id]), textarea:not([id])').forEach(input => {
            this.logBug('missing-label', {
                title: 'Missing Form Label',
                description: 'Form input missing associated label',
                severity: 'medium',
                category: 'accessibility',
                element: input.outerHTML
            });
        });
    }

    logBug(type, bugData) {
        const bug = {
            id: this.generateBugId(),
            type: type,
            title: bugData.title,
            description: bugData.description,
            severity: bugData.severity || 'medium',
            category: bugData.category || 'functionality',
            status: 'open',
            createdAt: new Date().toISOString(),
            context: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            },
            details: bugData
        };

        this.addBug(bug);
    }

    addBug(bug) {
        this.bugs.set(bug.id, bug);
        this.saveBugs();
        this.notifyBugAdded(bug);
    }

    updateBug(id, updates) {
        const bug = this.bugs.get(id);
        if (bug) {
            const updatedBug = { ...bug, ...updates, updatedAt: new Date().toISOString() };
            this.bugs.set(id, updatedBug);
            this.saveBugs();
            this.notifyBugUpdated(updatedBug);
        }
    }

    generateBugId() {
        return `bug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    notifyBugAdded(bug) {
        // Dispatch custom event for bug added
        window.dispatchEvent(new CustomEvent('bug-added', { detail: bug }));

        // Show notification for critical/high severity bugs
        if (bug.severity === 'critical' || bug.severity === 'high') {
            this.showBugNotification(bug);
        }
    }

    notifyBugUpdated(bug) {
        // Dispatch custom event for bug updated
        window.dispatchEvent(new CustomEvent('bug-updated', { detail: bug }));
    }

    showBugNotification(bug) {
        const notification = document.createElement('div');
        notification.className = 'bug-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <span class="severity-indicator severity-${bug.severity}"></span>
                    <h4>${bug.title}</h4>
                </div>
                <p>${bug.description}</p>
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    // Public API
    getBugs(filters = {}) {
        let bugs = Array.from(this.bugs.values());

        if (filters.severity) {
            bugs = bugs.filter(bug => bug.severity === filters.severity);
        }

        if (filters.category) {
            bugs = bugs.filter(bug => bug.category === filters.category);
        }

        if (filters.status) {
            bugs = bugs.filter(bug => bug.status === filters.status);
        }

        return bugs.sort((a, b) => {
            const severityA = this.severityLevels[a.severity];
            const severityB = this.severityLevels[b.severity];
            return severityB - severityA;
        });
    }

    getBug(id) {
        return this.bugs.get(id);
    }

    getBugStats() {
        const bugs = Array.from(this.bugs.values());
        const stats = {
            total: bugs.length,
            bySeverity: {},
            byCategory: {},
            byStatus: {}
        };

        bugs.forEach(bug => {
            stats.bySeverity[bug.severity] = (stats.bySeverity[bug.severity] || 0) + 1;
            stats.byCategory[bug.category] = (stats.byCategory[bug.category] || 0) + 1;
            stats.byStatus[bug.status] = (stats.byStatus[bug.status] || 0) + 1;
        });

        return stats;
    }

    exportBugs() {
        const bugs = Array.from(this.bugs.values());
        const data = {
            exported: new Date().toISOString(),
            stats: this.getBugStats(),
            bugs: bugs
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `esplanada-eats-bugs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearBugs() {
        this.bugs.clear();
        this.saveBugs();
        window.dispatchEvent(new CustomEvent('bugs-cleared'));
    }
}
```

### UI Polish System

```javascript
// js/utils/ui-polisher.js
export class UIPolisher {
    constructor(bugTracker) {
        this.bugTracker = bugTracker;
        this.animationQueue = new Set();
        this.transitionElements = new Map();
        this.microInteractions = new Map();

        this.initialize();
    }

    initialize() {
        // Setup enhanced animations
        this.setupEnhancedAnimations();

        // Setup smooth transitions
        this.setupSmoothTransitions();

        // Setup micro-interactions
        this.setupMicroInteractions();

        // Setup keyboard navigation enhancements
        this.setupKeyboardNavigation();

        // Setup visual feedback
        this.setupVisualFeedback();

        // Setup loading states
        this.setupLoadingStates();
    }

    setupEnhancedAnimations() {
        // Animate restaurant cards on scroll
        this.setupScrollAnimations();

        // Animate modals
        this.setupModalAnimations();

        // Animate form interactions
        this.setupFormAnimations();

        // Animate button interactions
        this.setupButtonAnimations();
    }

    setupScrollAnimations() {
        const cards = document.querySelectorAll('.restaurant-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;

            // Use IntersectionObserver for scroll-triggered animations
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                            observer.unobserve(card);
                        }
                    });
                }, { threshold: 0.1 });

                observer.observe(card);
            } else {
                // Fallback: animate immediately
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }

    setupModalAnimations() {
        // Override modal open/close with animations
        const originalShowModal = window.showModal;
        window.showModal = (content, options = {}) => {
            const modal = document.createElement('div');
            modal.className = 'modal animated';
            modal.innerHTML = `
                <div class="modal-backdrop fade-in"></div>
                <div class="modal-content scale-in">
                    ${content}
                </div>
            `;

            document.body.appendChild(modal);

            // Add close functionality
            const backdrop = modal.querySelector('.modal-backdrop');
            backdrop.addEventListener('click', () => {
                this.closeModal(modal);
            });

            return modal;
        };

        window.closeModal = (modal) => {
            if (modal) {
                modal.classList.add('closing');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            }
        };
    }

    setupFormAnimations() {
        // Animate form fields on focus
        document.querySelectorAll('.form-control').forEach(field => {
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('focused');
            });

            field.addEventListener('blur', () => {
                field.parentElement.classList.remove('focused');
            });
        });

        // Animate form validation feedback
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const element = mutation.target;
                    if (element.classList.contains('invalid') || element.classList.contains('valid')) {
                        this.animateValidationFeedback(element);
                    }
                }
            });
        });

        document.querySelectorAll('.form-control').forEach(field => {
            observer.observe(field, { attributes: true });
        });
    }

    animateValidationFeedback(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    setupButtonAnimations() {
        // Enhanced button animations
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createRippleEffect(e, button);
            });

            button.addEventListener('click', (e) => {
                this.createClickEffect(e, button);
            });
        });
    }

    createRippleEffect(event, button) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createClickEffect(event, button) {
        const effect = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const x = event.clientX;
        const y = event.clientY;

        effect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.8);
            pointer-events: none;
            transform: translate(-50%, -50%) scale(0);
            animation: click-burst 0.6s ease-out;
            z-index: 9999;
        `;

        document.body.appendChild(effect);

        setTimeout(() => {
            effect.remove();
        }, 600);
    }

    setupSmoothTransitions() {
        // Add smooth transitions to all interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, .restaurant-card, .modal-content');
        interactiveElements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
        });

        // Add page transition effects
        this.setupPageTransitions();
    }

    setupPageTransitions() {
        // Add fade-in effect to page content
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    }

    setupMicroInteractions() {
        // Setup subtle hover effects
        this.setupHoverEffects();

        // Setup focus indicators
        this.setupFocusIndicators();

        // Setup loading spinners
        this.setupLoadingSpinners();

        // Setup progress indicators
        this.setupProgressIndicators();
    }

    setupHoverEffects() {
        // Enhanced hover effects for cards
        document.querySelectorAll('.restaurant-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            });
        });

        // Subtle hover effects for buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0)';
            });
        });
    }

    setupFocusIndicators() {
        // Enhanced focus indicators for keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Focus styles for interactive elements
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
            }
        `;
        document.head.appendChild(style);
    }

    setupLoadingSpinners() {
        // Create loading spinner component
        this.createLoadingSpinner = () => {
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.innerHTML = `
                <div class="spinner-circle"></div>
                <div class="spinner-text">Loading...</div>
            `;
            return spinner;
        };
    }

    setupProgressIndicators() {
        // Create progress indicator for async operations
        this.createProgressIndicator = (progress) => {
            const indicator = document.createElement('div');
            indicator.className = 'progress-indicator';
            indicator.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${progress}%</div>
            `;
            return indicator;
        };
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation
        this.setupKeyboardShortcuts();

        // Setup focus trapping for modals
        this.setupFocusTrapping();

        // Setup arrow key navigation
        this.setupArrowKeyNavigation();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        window.closeModal(modal);
                    }
                });
            }

            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearchInput();
            }

            // Ctrl/Cmd + N for new restaurant
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.openNewRestaurantForm();
            }
        });
    }

    setupFocusTrapping() {
        // Trap focus within modals
        const trapFocus = (modal) => {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            e.preventDefault();
                            lastFocusable.focus();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            e.preventDefault();
                            firstFocusable.focus();
                        }
                    }
                }
            });
        };

        // Apply to all modals
        document.querySelectorAll('.modal').forEach(trapFocus);
    }

    setupArrowKeyNavigation() {
        // Arrow key navigation for restaurant cards
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                const cards = document.querySelectorAll('.restaurant-card');
                const focusedCard = document.activeElement.closest('.restaurant-card');

                if (focusedCard) {
                    e.preventDefault();
                    const currentIndex = Array.from(cards).indexOf(focusedCard);
                    let newIndex = currentIndex;

                    switch (e.key) {
                        case 'ArrowUp':
                            newIndex = Math.max(0, currentIndex - 1);
                            break;
                        case 'ArrowDown':
                            newIndex = Math.min(cards.length - 1, currentIndex + 1);
                            break;
                        case 'ArrowLeft':
                            newIndex = Math.max(0, currentIndex - 1);
                            break;
                        case 'ArrowRight':
                            newIndex = Math.min(cards.length - 1, currentIndex + 1);
                            break;
                    }

                    if (newIndex !== currentIndex) {
                        cards[newIndex].focus();
                        cards[newIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        });
    }

    setupVisualFeedback() {
        // Setup toast notifications
        this.setupToastNotifications();

        // Setup success/error animations
        this.setupSuccessErrorAnimations();

        // Setup confirmation dialogs
        this.setupConfirmationDialogs();
    }

    setupToastNotifications() {
        this.showToast = (message, type = 'info') => {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${this.getToastIcon(type)}</span>
                    <span class="toast-message">${message}</span>
                    <button class="toast-close" onclick="this.closest('.toast').remove()">&times;</button>
                </div>
            `;

            document.body.appendChild(toast);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 5000);
        };
    }

    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    setupSuccessErrorAnimations() {
        // Animate form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const button = form.querySelector('button[type="submit"]');
                if (button) {
                    button.classList.add('submitting');
                    button.disabled = true;
                    button.innerHTML = '<span class="spinner"></span> Submitting...';
                }
            });
        });
    }

    setupConfirmationDialogs() {
        this.showConfirmation = (message, onConfirm, onCancel) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirmation-dialog';
            dialog.innerHTML = `
                <div class="dialog-overlay">
                    <div class="dialog-content">
                        <h3>Confirm</h3>
                        <p>${message}</p>
                        <div class="dialog-actions">
                            <button class="btn-cancel">Cancel</button>
                            <button class="btn-confirm">Confirm</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // Setup button actions
            dialog.querySelector('.btn-cancel').addEventListener('click', () => {
                dialog.remove();
                if (onCancel) onCancel();
            });

            dialog.querySelector('.btn-confirm').addEventListener('click', () => {
                dialog.remove();
                if (onConfirm) onConfirm();
            });

            // Close on overlay click
            dialog.querySelector('.dialog-overlay').addEventListener('click', () => {
                dialog.remove();
                if (onCancel) onCancel();
            });
        };
    }

    setupLoadingStates() {
        // Show loading states for async operations
        this.showLoading = (element) => {
            element.classList.add('loading');
            element.disabled = true;
        };

        this.hideLoading = (element) => {
            element.classList.remove('loading');
            element.disabled = false;
        };
    }

    // Public API
    polishUI() {
        // Apply all polish enhancements
        this.setupEnhancedAnimations();
        this.setupSmoothTransitions();
        this.setupMicroInteractions();
        this.setupKeyboardNavigation();
        this.setupVisualFeedback();
    }

    addCustomAnimation(element, animation) {
        // Add custom animation to element
        element.style.animation = animation;
    }

    removeCustomAnimation(element) {
        // Remove custom animation from element
        element.style.animation = '';
    }
}
```

### Final CSS Polish

```css
/* Final UI Polish Styles */

/* Animation keyframes */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@keyframes slideIn {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
}

@keyframes slideOut {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
}

@keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

@keyframes scaleOut {
    from { transform: scale(1); opacity: 1; }
    to { transform: scale(0.8); opacity: 0; }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes ripple {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(4); opacity: 0; }
}

@keyframes click-burst {
    from { transform: translate(-50%, -50%) scale(0); opacity: 1; }
    to { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Modal animations */
.modal.animated .modal-backdrop.fade-in {
    animation: fadeIn 0.3s ease;
}

.modal.animated .modal-content.scale-in {
    animation: scaleIn 0.3s ease;
}

.modal.closing .modal-backdrop {
    animation: fadeOut 0.3s ease;
}

.modal.closing .modal-content {
    animation: scaleOut 0.3s ease;
}

/* Enhanced button styles */
.btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn.submitting {
    position: relative;
    color: transparent;
}

.btn.submitting .spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Restaurant card enhancements */
.restaurant-card {
    transition: all 0.3s ease;
    cursor: pointer;
}

.restaurant-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.restaurant-card:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* Form field enhancements */
.form-group.focused .form-control {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control.invalid {
    animation: shake 0.5s ease-in-out;
    border-color: #ef4444;
}

.form-control.valid {
    border-color: #10b981;
}

/* Loading spinner */
.loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

.spinner-circle {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.spinner-text {
    color: #6b7280;
    font-size: 0.875rem;
}

/* Progress indicator */
.progress-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.progress-bar {
    width: 200px;
    height: 8px;
    background-color: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #3b82f6;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 0.875rem;
    color: #6b7280;
}

/* Toast notifications */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    min-width: 300px;
    max-width: 400px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
}

.toast-success {
    border-left: 4px solid #10b981;
}

.toast-error {
    border-left: 4px solid #ef4444;
}

.toast-warning {
    border-left: 4px solid #f59e0b;
}

.toast-info {
    border-left: 4px solid #3b82f6;
}

.toast-content {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 0.75rem;
}

.toast-icon {
    font-size: 1.25rem;
    font-weight: bold;
}

.toast-success .toast-icon {
    color: #10b981;
}

.toast-error .toast-icon {
    color: #ef4444;
}

.toast-warning .toast-icon {
    color: #f59e0b;
}

.toast-info .toast-icon {
    color: #3b82f6;
}

.toast-message {
    flex: 1;
    color: #1f2937;
}

.toast-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    margin-left: 0.5rem;
}

.toast-close:hover {
    color: #1f2937;
}

/* Confirmation dialog */
.confirmation-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    animation: fadeIn 0.3s ease;
}

.dialog-content {
    position: relative;
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    animation: scaleIn 0.3s ease;
}

.dialog-content h3 {
    margin: 0 0 1rem 0;
    color: #1f2937;
}

.dialog-content p {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    line-height: 1.5;
}

.dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.dialog-actions .btn-cancel {
    background-color: #f3f4f6;
    color: #6b7280;
    border: 1px solid #d1d5db;
}

.dialog-actions .btn-cancel:hover {
    background-color: #e5e7eb;
}

.dialog-actions .btn-confirm {
    background-color: #ef4444;
    color: white;
    border: 1px solid #ef4444;
}

.dialog-actions .btn-confirm:hover {
    background-color: #dc2626;
}

/* Bug report styles */
.bug-report-btn {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.bug-report-btn:hover {
    background-color: #dc2626;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.bug-report-form {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.bug-report-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.bug-report-content {
    position: relative;
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.bug-report-content h2 {
    margin: 0 0 1.5rem 0;
    color: #1f2937;
}

.bug-report-content .form-group {
    margin-bottom: 1.5rem;
}

.bug-report-content label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #1f2937;
}

.bug-report-content input,
.bug-report-content select,
.bug-report-content textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
}

.bug-report-content textarea {
    resize: vertical;
    min-height: 100px;
}

.bug-report-content .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
}

.bug-report-content .btn-cancel {
    background-color: #f3f4f6;
    color: #6b7280;
    border: 1px solid #d1d5db;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
}

.bug-report-content .btn-cancel:hover {
    background-color: #e5e7eb;
}

.bug-report-content .btn-submit {
    background-color: #ef4444;
    color: white;
    border: 1px solid #ef4444;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    cursor: pointer;
}

.bug-report-content .btn-submit:hover {
    background-color: #dc2626;
}

.bug-report-success {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #dcfce7;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 1rem;
    max-width: 400px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bug-report-success .success-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.bug-report-success h3 {
    margin: 0;
    color: #166534;
}

.bug-report-success p {
    margin: 0;
    color: #166534;
}

.bug-report-success button {
    align-self: flex-end;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
}

.bug-report-success button:hover {
    background-color: #059669;
}

/* Bug notification */
.bug-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    max-width: 400px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.bug-notification .notification-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.bug-notification .notification-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.bug-notification .severity-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.bug-notification .severity-critical {
    background-color: #dc2626;
}

.bug-notification .severity-high {
    background-color: #ea580c;
}

.bug-notification .severity-medium {
    background-color: #d97706;
}

.bug-notification .severity-low {
    background-color: #65a30d;
}

.bug-notification .severity-cosmetic {
    background-color: #6b7280;
}

.bug-notification h4 {
    margin: 0;
    color: #991b1b;
}

.bug-notification p {
    margin: 0;
    color: #7f1d1d;
}

.bug-notification button {
    align-self: flex-end;
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
}

.bug-notification button:hover {
    background-color: #dc2626;
}

/* Accessibility improvements */
.keyboard-navigation *:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

/* High contrast mode */
@media (prefers-contrast: high) {
    .btn {
        border-width: 2px;
    }

    .restaurant-card {
        border: 2px solid #1f2937;
    }

    .form-control {
        border-width: 2px;
    }

    .modal-content {
        border: 2px solid #1f2937;
    }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Print styles */
@media print {
    .bug-report-btn,
    .bug-report-form,
    .bug-report-success,
    .bug-notification,
    .toast,
    .modal {
        display: none !important;
    }

    .restaurant-card {
        break-inside: avoid;
        border: 1px solid #ccc;
        margin-bottom: 1rem;
    }
}

/* RTL support */
[dir="rtl"] .bug-report-btn {
    right: auto;
    left: 20px;
}

[dir="rtl"] .toast {
    right: auto;
    left: 20px;
}

[dir="rtl"] .bug-notification {
    right: auto;
    left: 20px;
}
```

### Dependencies
- Story 2.4: Form Validation & Error Handling (for final form polish)
- Story 4.1: Responsive Design Refinement (for final responsive polish)
- Story 4.3: Browser Compatibility Testing (for final compatibility fixes)
- All previous stories for comprehensive bug fixing

### Testing
- All high-priority bugs identified and resolved
- Smooth animations and transitions throughout the application
- Comprehensive accessibility improvements implemented
- Robust error handling for all edge cases
- Performance optimized with measurable improvements
- User feedback mechanisms operational
- Professional, polished user experience delivered
- Production-ready application with no critical issues

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