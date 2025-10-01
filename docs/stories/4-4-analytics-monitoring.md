# Story 4.4: Analytics & Monitoring

## Status
Draft

## Story
**As a** system administrator,
**I want** to collect usage data and monitor application performance,
**so that** I can understand how users interact with the system and identify opportunities for improvement.

## Acceptance Criteria
1. User events must be tracked (views, clicks, ratings)
2. Performance metrics must be monitored (load times, error rates)
3. Dashboard must display real-time data
4. Alerts must be configured for critical issues
5. User data must be anonymized for privacy
6. Reports must be generated automatically
7. Monitoring must cover frontend and backend
8. System must be scalable and secure

## Tasks / Subtasks
- [ ] Task 4.4.1: Event tracking implementation (AC: 1)
  - [ ] Subtask 4.4.1.1: Track page views and navigation events
  - [ ] Subtask 4.4.1.2: Track user interactions (clicks, form submissions)
  - [ ] Subtask 4.4.1.3: Track rating submissions and restaurant interactions
  - [ ] Subtask 4.4.1.4: Track photo upload events
  - [ ] Subtask 4.4.1.5: Track search and filter usage
  - [ ] Subtask 4.4.1.6: Track modal interactions
  - [ ] Subtask 4.4.1.7: Track error events and user feedback
  - [ ] Subtask 4.4.1.8: Track custom business events

- [ ] Task 4.4.2: Performance monitoring implementation (AC: 2)
  - [ ] Subtask 4.4.2.1: Monitor page load performance metrics
  - [ ] Subtask 4.4.2.2: Track Core Web Vitals (CLS, FID, FCP, LCP, TTFB)
  - [ ] Subtask 4.4.2.3: Monitor API response times and error rates
  - [ ] Subtask 4.4.2.4: Track Firebase query performance
  - [ ] Subtask 4.4.2.5: Monitor image loading performance
  - [ ] Subtask 4.4.2.6: Track JavaScript execution times
  - [ ] Subtask 4.4.2.7: Monitor memory usage and leaks
  - [ ] Subtask 4.4.2.8: Track network performance and connectivity

- [ ] Task 4.4.3: Real-time dashboard implementation (AC: 3)
  - [ ] Subtask 4.4.3.1: Create analytics dashboard interface
  - [ ] Subtask 4.4.3.2: Implement real-time data visualization
  - [ ] Subtask 4.4.3.3: Add filtering and date range options
  - [ ] Subtask 4.4.3.4: Create popular restaurants analytics
  - [ ] Subtask 4.4.3.5: Implement device and browser analytics
  - [ ] Subtask 4.4.3.6: Add user engagement metrics
  - [ ] Subtask 4.4.3.7: Create performance metrics dashboard
  - [ ] Subtask 4.4.3.8: Implement export functionality

- [ ] Task 4.4.4: Alert system implementation (AC: 4)
  - [ ] Subtask 4.4.4.1: Configure performance threshold alerts
  - [ ] Subtask 4.4.4.2: Set up error rate monitoring and alerts
  - [ ] Subtask 4.4.4.3: Implement system health monitoring
  - [ ] Subtask 4.4.4.4: Create notification system for critical issues
  - [ ] Subtask 4.4.4.5: Set up automated reporting
  - [ ] Subtask 4.4.4.6: Implement escalation procedures
  - [ ] Subtask 4.4.4.7: Add alert history and tracking
  - [ ] Subtask 4.4.4.8: Test alert delivery mechanisms

- [ ] Task 4.4.5: Privacy and data protection (AC: 5)
  - [ ] Subtask 4.4.5.1: Implement user data anonymization
  - [ ] Subtask 4.4.5.2: Configure IP address anonymization
  - [ ] Subtask 4.4.5.3: Add cookie consent management
  - [ ] Subtask 4.4.5.4: Implement data retention policies
  - [ ] Subtask 4.4.5.5: Add privacy policy integration
  - [ ] Subtask 4.4.5.6: Configure secure data transmission
  - [ ] Subtask 4.4.5.7: Implement user opt-out mechanisms
  - [ ] Subtask 4.4.5.8: Add compliance with data protection regulations

- [ ] Task 4.4.6: Automated reporting implementation (AC: 6)
  - [ ] Subtask 4.4.6.1: Create daily/weekly/monthly reports
  - [ ] Subtask 4.4.6.2: Implement automated email reports
  - [ ] Subtask 4.4.6.3: Add custom report generation
  - [ ] Subtask 4.4.6.4: Create trend analysis reports
  - [ ] Subtask 4.4.6.5: Implement data export functionality
  - [ ] Subtask 4.4.6.6: Add scheduled report delivery
  - [ ] Subtask 4.4.6.7: Create report templates
  - [ ] Subtask 4.4.6.8: Test report accuracy and completeness

- [ ] Task 4.4.7: Comprehensive monitoring coverage (AC: 7)
  - [ ] Subtask 4.4.7.1: Monitor frontend application performance
  - [ ] Subtask 4.4.7.2: Track backend API performance and errors
  - [ ] Subtask 4.4.7.3: Monitor Firebase service health
  - [ ] Subtask 4.4.7.4: Track CDN performance and availability
  - [ ] Subtask 4.4.7.5: Monitor third-party service integrations
  - [ ] Subtask 4.4.7.6: Track user experience metrics
  - [ ] Subtask 4.4.7.7: Implement system-wide monitoring
  - [ ] Subtask 4.4.7.8: Add cross-platform monitoring

- [ ] Task 4.4.8: System security and scalability (AC: 8)
  - [ ] Subtask 4.4.8.1: Implement secure data collection and storage
  - [ ] Subtask 4.4.8.2: Add authentication for analytics access
  - [ ] Subtask 4.4.8.3: Implement rate limiting for analytics endpoints
  - [ ] Subtask 4.4.8.4: Design scalable data architecture
  - [ ] Subtask 4.4.8.5: Add data backup and recovery procedures
  - [ ] Subtask 4.4.8.6: Implement data integrity checks
  - [ ] Subtask 4.4.8.7: Add security monitoring and audit trails
  - [ ] Subtask 4.4.8.8: Test system under high load conditions

## Dev Notes

### Google Analytics Integration

```javascript
// services/AnalyticsService.js
class AnalyticsService {
  constructor() {
    this.initialized = false;
    this.eventQueue = [];
    this.userId = null;
    this.sessionId = null;
  }

  async init() {
    if (this.initialized) return;

    // Initialize Google Analytics
    await this.loadGoogleAnalytics();

    // Initialize Firebase Analytics
    await this.initFirebaseAnalytics();

    // Generate user and session IDs
    await this.generateIds();

    // Track initial page view
    this.trackPageView();

    // Setup event listeners
    this.setupEventListeners();

    this.initialized = true;
  }

  async loadGoogleAnalytics() {
    return new Promise((resolve, reject) => {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        dataLayer.push(arguments);
      };

      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX', {
        send_page_view: false,
        anonymize_ip: true,
        cookie_expires: 365 * 24 * 60 * 60 // 1 year
      });
    });
  }

  async initFirebaseAnalytics() {
    if (typeof firebase !== 'undefined' && firebase.analytics) {
      this.firebaseAnalytics = firebase.analytics();
    }
  }

  async generateIds() {
    // Generate or retrieve user ID
    this.userId = await this.getUserId();

    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Set user properties
    this.setUserProperties();
  }

  async getUserId() {
    // Check if user ID exists in localStorage
    let userId = localStorage.getItem('analytics_user_id');

    if (!userId) {
      // Generate new user ID
      userId = this.generateUserId();
      localStorage.setItem('analytics_user_id', userId);
    }

    return userId;
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  setUserProperties() {
    // Set user properties in Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('set', 'user_properties', {
        session_id: this.sessionId,
        app_version: '1.0.0',
        platform: navigator.platform,
        browser: navigator.userAgent
      });
    }

    // Set user ID in Firebase Analytics
    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.setUserId(this.userId);
      this.firebaseAnalytics.setUserProperties({
        session_id: this.sessionId,
        app_version: '1.0.0'
      });
    }
  }

  trackPageView(pageTitle = null, pageLocation = null) {
    const title = pageTitle || document.title;
    const location = pageLocation || window.location.href;

    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_title: title,
        page_location: location,
        send_to: 'G-XXXXXXXXXX'
      });
    }

    // Firebase Analytics
    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.logEvent('page_view', {
        page_title: title,
        page_location: location
      });
    }

    // Custom event for internal tracking
    this.trackCustomEvent('page_view', {
      title,
      location,
      timestamp: Date.now()
    });
  }

  trackEvent(eventName, parameters = {}) {
    const eventParams = {
      ...parameters,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: Date.now()
    };

    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        ...parameters,
        send_to: 'G-XXXXXXXXXX'
      });
    }

    // Firebase Analytics
    if (this.firebaseAnalytics) {
      this.firebaseAnalytics.logEvent(eventName, parameters);
    }

    // Custom event for internal tracking
    this.trackCustomEvent(eventName, eventParams);
  }

  trackCustomEvent(eventName, parameters) {
    this.eventQueue.push({
      event: eventName,
      parameters,
      timestamp: Date.now()
    });

    // Keep only last 100 events in memory
    if (this.eventQueue.length > 100) {
      this.eventQueue = this.eventQueue.slice(-100);
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(eventName, parameters);
  }

  async sendToCustomAnalytics(eventName, parameters) {
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: eventName,
          parameters,
          user_id: this.userId,
          session_id: this.sessionId,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })
      });

      if (!response.ok) {
        console.warn('Failed to send custom analytics event:', eventName);
      }
    } catch (error) {
      console.warn('Error sending custom analytics event:', error);
    }
  }

  setupEventListeners() {
    // Track click events
    document.addEventListener('click', (e) => {
      const target = e.target;
      const clickable = target.closest('button, a, .clickable, .restaurant-card');

      if (clickable) {
        this.trackClickEvent(clickable, e);
      }
    });

    // Track form submissions
    document.addEventListener('submit', (e) => {
      this.trackFormSubmission(e);
    });

    // Track modal opens
    document.addEventListener('modal-open', (e) => {
      this.trackEvent('modal_open', {
        modal_type: e.detail.type,
        modal_id: e.detail.id
      });
    });

    // Track rating submissions
    document.addEventListener('rating-submitted', (e) => {
      this.trackEvent('rating_submitted', {
        restaurant_id: e.detail.restaurantId,
        rating: e.detail.rating,
        has_comment: e.detail.hasComment,
        has_photos: e.detail.hasPhotos
      });
    });

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track errors
    this.trackErrors();

    // Track offline/online events
    this.trackConnectivity();
  }

  trackClickEvent(element, event) {
    const elementData = this.getElementData(element);

    this.trackEvent('click', {
      element_type: elementData.type,
      element_id: elementData.id,
      element_text: elementData.text,
      page_location: window.location.pathname
    });
  }

  trackFormSubmission(event) {
    const form = event.target;
    const formData = new FormData(form);

    this.trackEvent('form_submission', {
      form_id: form.id,
      form_action: form.action,
      has_data: formData.size > 0
    });
  }

  getElementData(element) {
    return {
      type: element.tagName.toLowerCase(),
      id: element.id || null,
      text: element.textContent?.trim().substring(0, 100) || null,
      class: element.className || null
    };
  }

  trackPerformanceMetrics() {
    // Track page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        const metrics = {
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          load_complete: navigation.loadEventEnd - navigation.loadEventStart,
          first_paint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          first_contentful_paint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          time_to_interactive: navigation.domInteractive - navigation.fetchStart
        };

        this.trackEvent('performance_metrics', metrics);
      });
    }

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  trackCoreWebVitals() {
    if ('web-vitals' in window) {
      // Import web-vitals library
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          this.trackEvent('web_vital_cls', {
            value: metric.value,
            id: metric.id
          });
        });

        getFID((metric) => {
          this.trackEvent('web_vital_fid', {
            value: metric.value,
            id: metric.id
          });
        });

        getFCP((metric) => {
          this.trackEvent('web_vital_fcp', {
            value: metric.value,
            id: metric.id
          });
        });

        getLCP((metric) => {
          this.trackEvent('web_vital_lcp', {
            value: metric.value,
            id: metric.id
          });
        });

        getTTFB((metric) => {
          this.trackEvent('web_vital_ttfb', {
            value: metric.value,
            id: metric.id
          });
        });
      });
    }
  }

  trackErrors() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('promise_rejection', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
    });

    // Track API errors
    this.trackApiErrors();
  }

  trackApiErrors() {
    // Intercept fetch calls to track errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          this.trackEvent('api_error', {
            url: response.url,
            status: response.status,
            status_text: response.statusText
          });
        }

        return response;
      } catch (error) {
        this.trackEvent('api_error', {
          url: args[0],
          error: error.message
        });
        throw error;
      }
    };
  }

  trackConnectivity() {
    // Track online/offline events
    window.addEventListener('online', () => {
      this.trackEvent('connectivity_change', {
        status: 'online'
      });
    });

    window.addEventListener('offline', () => {
      this.trackEvent('connectivity_change', {
        status: 'offline'
      });
    });

    // Track connection quality
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.trackEvent('connection_change', {
          effective_type: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        });
      });
    }
  }

  // Specific business events
  trackRestaurantView(restaurantId) {
    this.trackEvent('restaurant_view', {
      restaurant_id: restaurantId
    });
  }

  trackRatingSubmission(restaurantId, rating, hasComment = false, hasPhotos = false) {
    this.trackEvent('rating_submission', {
      restaurant_id: restaurantId,
      rating,
      has_comment: hasComment,
      has_photos: hasPhotos
    });
  }

  trackPhotoUpload(restaurantId, photoCount) {
    this.trackEvent('photo_upload', {
      restaurant_id: restaurantId,
      photo_count: photoCount
    });
  }

  trackSearch(query, resultCount) {
    this.trackEvent('search', {
      query,
      result_count: resultCount
    });
  }

  // Get analytics data for internal use
  getEventQueue() {
    return [...this.eventQueue];
  }

  getAnalyticsSummary() {
    const events = this.eventQueue;

    return {
      total_events: events.length,
      unique_events: [...new Set(events.map(e => e.event))].length,
      session_duration: this.getSessionDuration(),
      page_views: events.filter(e => e.event === 'page_view').length,
      rating_submissions: events.filter(e => e.event === 'rating_submission').length
    };
  }

  getSessionDuration() {
    if (!this.sessionId) return 0;

    const sessionEvents = this.eventQueue.filter(e => e.parameters.session_id === this.sessionId);
    if (sessionEvents.length === 0) return 0;

    const firstEvent = Math.min(...sessionEvents.map(e => e.timestamp));
    const lastEvent = Math.max(...sessionEvents.map(e => e.timestamp));

    return lastEvent - firstEvent;
  }
}

// Export for global use
window.AnalyticsService = AnalyticsService;
```

### Custom Analytics Dashboard

```javascript
// components/AnalyticsDashboard.js
class AnalyticsDashboard {
  constructor() {
    this.data = [];
    this.filters = {
      dateRange: '7d',
      eventType: 'all'
    };
    this.charts = new Map();
    this.init();
  }

  async init() {
    await this.loadAnalyticsData();
    this.setupFilters();
    this.renderDashboard();
    this.setupRealTimeUpdates();
  }

  async loadAnalyticsData() {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.filters)
      });

      if (response.ok) {
        this.data = await response.json();
      } else {
        console.error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }

  setupFilters() {
    const dateFilter = document.getElementById('date-filter');
    const eventFilter = document.getElementById('event-filter');

    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        this.filters.dateRange = e.target.value;
        this.refreshData();
      });
    }

    if (eventFilter) {
      eventFilter.addEventListener('change', (e) => {
        this.filters.eventType = e.target.value;
        this.refreshData();
      });
    }
  }

  renderDashboard() {
    const container = document.getElementById('analytics-dashboard');
    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-header">
        <h2>Analytics Dashboard</h2>
        <div class="dashboard-filters">
          <select id="date-filter">
            <option value="1d">Últimas 24 horas</option>
            <option value="7d" selected>Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <select id="event-filter">
            <option value="all" selected>Todos eventos</option>
            <option value="page_view">Visualizações</option>
            <option value="rating_submission">Avaliações</option>
            <option value="restaurant_view">Restaurantes</option>
            <option value="photo_upload">Fotos</option>
          </select>
        </div>
      </div>

      <div class="dashboard-metrics">
        ${this.renderMetricsCards()}
      </div>

      <div class="dashboard-charts">
        <div class="chart-container">
          <h3>Eventos por Hora</h3>
          <canvas id="hourly-chart"></canvas>
        </div>
        <div class="chart-container">
          <h3>Eventos por Tipo</h3>
          <canvas id="event-type-chart"></canvas>
        </div>
      </div>

      <div class="dashboard-tables">
        <div class="table-container">
          <h3>Restaurantes Mais Populares</h3>
          <div id="popular-restaurants-table"></div>
        </div>
        <div class="table-container">
          <h3>Dispositivos e Navegadores</h3>
          <div id="devices-table"></div>
        </div>
      </div>
    `;

    this.renderCharts();
    this.renderTables();
  }

  renderMetricsCards() {
    const metrics = this.calculateMetrics();

    return `
      <div class="metric-card">
        <div class="metric-value">${metrics.totalUsers.toLocaleString()}</div>
        <div class="metric-label">Usuários Únicos</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.totalPageViews.toLocaleString()}</div>
        <div class="metric-label">Visualizações</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.totalRatings.toLocaleString()}</div>
        <div class="metric-label">Avaliações</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.avgSessionDuration}</div>
        <div class="metric-label">Duração Média da Sessão</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.bounceRate}%</div>
        <div class="metric-label">Taxa de Rejeição</div>
      </div>
    `;
  }

  calculateMetrics() {
    const sessions = this.data.sessions || [];
    const events = this.data.events || [];

    const totalUsers = new Set(sessions.map(s => s.user_id)).size;
    const totalPageViews = events.filter(e => e.event === 'page_view').length;
    const totalRatings = events.filter(e => e.event === 'rating_submission').length;

    const sessionDurations = sessions.map(s => s.duration);
    const avgSessionDuration = sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length / 1000)
      : 0;

    const bounceRate = sessions.length > 0
      ? Math.round((sessions.filter(s => s.page_views === 1).length / sessions.length) * 100)
      : 0;

    return {
      totalUsers,
      totalPageViews,
      totalRatings,
      avgSessionDuration: this.formatDuration(avgSessionDuration),
      bounceRate
    };
  }

  formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  }

  renderCharts() {
    this.renderHourlyChart();
    this.renderEventTypeChart();
  }

  renderHourlyChart() {
    const canvas = document.getElementById('hourly-chart');
    if (!canvas) return;

    const hourlyData = this.getHourlyData();

    // Using Chart.js (would need to be loaded)
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: hourlyData.labels,
        datasets: [{
          label: 'Eventos',
          data: hourlyData.data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  renderEventTypeChart() {
    const canvas = document.getElementById('event-type-chart');
    if (!canvas) return;

    const eventTypeData = this.getEventTypeData();

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: eventTypeData.labels,
        datasets: [{
          data: eventTypeData.data,
          backgroundColor: [
            'rgb(59, 130, 246)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(139, 92, 246)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  getHourlyData() {
    const events = this.data.events || [];
    const hourlyCounts = new Array(24).fill(0);

    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyCounts[hour]++;
    });

    return {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      data: hourlyCounts
    };
  }

  getEventTypeData() {
    const events = this.data.events || [];
    const eventCounts = {};

    events.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });

    return {
      labels: Object.keys(eventCounts),
      data: Object.values(eventCounts)
    };
  }

  renderTables() {
    this.renderPopularRestaurants();
    this.renderDevicesTable();
  }

  renderPopularRestaurants() {
    const container = document.getElementById('popular-restaurants-table');
    if (!container) return;

    const popularRestaurants = this.getPopularRestaurants();

    container.innerHTML = `
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Restaurante</th>
            <th>Visualizações</th>
            <th>Avaliações</th>
            <th>Avaliação Média</th>
          </tr>
        </thead>
        <tbody>
          ${popularRestaurants.map(restaurant => `
            <tr>
              <td>${restaurant.name}</td>
              <td>${restaurant.views.toLocaleString()}</td>
              <td>${restaurant.ratings.toLocaleString()}</td>
              <td>${restaurant.avgRating.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderDevicesTable() {
    const container = document.getElementById('devices-table');
    if (!container) return;

    const devices = this.getDevicesData();

    container.innerHTML = `
      <table class="analytics-table">
        <thead>
          <tr>
            <th>Dispositivo</th>
            <th>Navegador</th>
            <th>Usuários</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          ${devices.map(device => `
            <tr>
              <td>${device.device}</td>
              <td>${device.browser}</td>
              <td>${device.users.toLocaleString()}</td>
              <td>${device.percentage}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  getPopularRestaurants() {
    const events = this.data.events || [];
    const restaurantStats = {};

    events.forEach(event => {
      if (event.event === 'restaurant_view' || event.event === 'rating_submission') {
        const restaurantId = event.parameters.restaurant_id;
        if (!restaurantStats[restaurantId]) {
          restaurantStats[restaurantId] = {
            views: 0,
            ratings: 0,
            totalRating: 0
          };
        }

        if (event.event === 'restaurant_view') {
          restaurantStats[restaurantId].views++;
        } else if (event.event === 'rating_submission') {
          restaurantStats[restaurantId].ratings++;
          restaurantStats[restaurantId].totalRating += event.parameters.rating || 0;
        }
      }
    });

    return Object.entries(restaurantStats)
      .map(([restaurantId, stats]) => ({
        id: restaurantId,
        name: this.getRestaurantName(restaurantId),
        views: stats.views,
        ratings: stats.ratings,
        avgRating: stats.ratings > 0 ? stats.totalRating / stats.ratings : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  getDevicesData() {
    const sessions = this.data.sessions || [];
    const deviceStats = {};

    sessions.forEach(session => {
      const key = `${session.device}_${session.browser}`;
      if (!deviceStats[key]) {
        deviceStats[key] = {
          device: session.device,
          browser: session.browser,
          users: 0
        };
      }
      deviceStats[key].users++;
    });

    const totalUsers = Object.values(deviceStats).reduce((sum, d) => sum + d.users, 0);

    return Object.values(deviceStats)
      .map(device => ({
        ...device,
        percentage: Math.round((device.users / totalUsers) * 100)
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);
  }

  getRestaurantName(restaurantId) {
    // This would need to be implemented to fetch restaurant names
    return `Restaurante ${restaurantId}`;
  }

  setupRealTimeUpdates() {
    // Setup WebSocket or Server-Sent Events for real-time updates
    if (window.EventSource) {
      const eventSource = new EventSource('/api/analytics/realtime');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.updateRealTimeMetrics(data);
      };

      eventSource.onerror = () => {
        console.error('Real-time analytics connection lost');
        eventSource.close();
      };
    }
  }

  updateRealTimeMetrics(data) {
    // Update metrics in real-time
    if (data.active_users) {
      const activeUsersElement = document.getElementById('active-users');
      if (activeUsersElement) {
        activeUsersElement.textContent = data.active_users;
      }
    }

    // Show notification for important events
    if (data.important_event) {
      this.showNotification(data.important_event);
    }
  }

  showNotification(eventData) {
    // Show toast notification for important events
    const notification = document.createElement('div');
    notification.className = 'analytics-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${eventData.type}</strong>
        <p>${eventData.message}</p>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  async refreshData() {
    await this.loadAnalyticsData();
    this.renderDashboard();
  }
}
```

### Error Monitoring Service

```javascript
// services/ErrorMonitoringService.js
class ErrorMonitoringService {
  constructor() {
    this.errorQueue = [];
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        user_agent: navigator.userAgent
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError('promise_rejection', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        user_agent: navigator.userAgent
      });
    });

    // API errors
    this.setupApiErrorMonitoring();

    // Resource loading errors
    this.setupResourceErrorMonitoring();
  }

  setupApiErrorMonitoring() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (!response.ok) {
          this.captureError('api_error', {
            url: response.url,
            status: response.status,
            status_text: response.statusText,
            method: args[1]?.method || 'GET'
          });
        }

        return response;
      } catch (error) {
        this.captureError('api_error', {
          url: args[0],
          error: error.message,
          method: args[1]?.method || 'GET'
        });
        throw error;
      }
    };
  }

  setupResourceErrorMonitoring() {
    window.addEventListener('error', (event) => {
      if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
        this.captureError('resource_error', {
          element: event.target.tagName,
          src: event.target.src || event.target.href,
          type: event.type
        });
      }
    }, true);
  }

  captureError(type, details) {
    const error = {
      type,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      user_id: this.getUserId(),
      session_id: this.getSessionId()
    };

    this.errorQueue.push(error);

    // Keep only last 50 errors
    if (this.errorQueue.length > 50) {
      this.errorQueue = this.errorQueue.slice(-50);
    }

    // Send to error monitoring service
    this.sendErrorToService(error);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', error);
    }
  }

  async sendErrorToService(error) {
    try {
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });

      if (!response.ok) {
        console.warn('Failed to send error to monitoring service');
      }
    } catch (err) {
      console.warn('Error sending error to monitoring service:', err);
    }
  }

  getUserId() {
    return localStorage.getItem('analytics_user_id') || 'anonymous';
  }

  getSessionId() {
    return sessionStorage.getItem('session_id') || 'unknown';
  }

  // Performance monitoring
  capturePerformanceMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      metadata,
      timestamp: Date.now(),
      url: window.location.href,
      user_agent: navigator.userAgent
    };

    this.sendPerformanceMetric(metric);
  }

  async sendPerformanceMetric(metric) {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric)
      });

      if (!response.ok) {
        console.warn('Failed to send performance metric');
      }
    } catch (error) {
      console.warn('Error sending performance metric:', error);
    }
  }

  // Get error summary for dashboard
  getErrorSummary() {
    const errorsByType = {};
    const errorsByUrl = {};

    this.errorQueue.forEach(error => {
      // Group by type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;

      // Group by URL
      errorsByUrl[error.url] = (errorsByUrl[error.url] || 0) + 1;
    });

    return {
      total_errors: this.errorQueue.length,
      errors_by_type: errorsByType,
      errors_by_url: errorsByUrl,
      recent_errors: this.errorQueue.slice(-10)
    };
  }
}

// Export for global use
window.ErrorMonitoringService = ErrorMonitoringService;
```

### API Endpoints for Analytics

```javascript
// Server-side analytics endpoints (Node.js/Express example)
const express = require('express');
const router = express.Router();

// Store analytics events
router.post('/api/analytics', async (req, res) => {
  try {
    const { event, parameters, user_id, session_id, timestamp } = req.body;

    // Store in database (example with MongoDB)
    await db.collection('analytics_events').insertOne({
      event,
      parameters,
      user_id,
      session_id,
      timestamp: new Date(timestamp),
      user_agent: req.body.user_agent,
      referrer: req.body.referrer,
      ip: req.ip
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing analytics event:', error);
    res.status(500).json({ error: 'Failed to store event' });
  }
});

// Get dashboard data
router.post('/api/analytics/dashboard', async (req, res) => {
  try {
    const { dateRange, eventType } = req.body;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Fetch events from database
    const events = await db.collection('analytics_events')
      .find({
        timestamp: { $gte: startDate, $lte: endDate },
        ...(eventType !== 'all' && { event: eventType })
      })
      .toArray();

    // Fetch sessions
    const sessions = await db.collection('analytics_sessions')
      .find({
        start_time: { $gte: startDate, $lte: endDate }
      })
      .toArray();

    res.json({
      events,
      sessions,
      dateRange,
      eventType
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Real-time analytics
router.get('/api/analytics/realtime', (req, res) => {
  // Setup Server-Sent Events for real-time updates
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Send real-time data every 5 seconds
  const interval = setInterval(() => {
    const activeUsers = Math.floor(Math.random() * 100) + 50; // Mock data
    const data = JSON.stringify({
      active_users: activeUsers,
      timestamp: Date.now()
    });

    res.write(`data: ${data}\n\n`);
  }, 5000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

// Error tracking endpoint
router.post('/api/errors', async (req, res) => {
  try {
    const error = req.body;

    await db.collection('errors').insertOne({
      ...error,
      timestamp: new Date(error.timestamp),
      created_at: new Date()
    });

    // Send alert for critical errors
    if (error.type === 'javascript_error' || error.type === 'api_error') {
      await sendErrorAlert(error);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing error:', error);
    res.status(500).json({ error: 'Failed to store error' });
  }
});

// Performance metrics endpoint
router.post('/api/performance', async (req, res) => {
  try {
    const metric = req.body;

    await db.collection('performance_metrics').insertOne({
      ...metric,
      timestamp: new Date(metric.timestamp),
      created_at: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error storing performance metric:', error);
    res.status(500).json({ error: 'Failed to store metric' });
  }
});

// Helper function to send error alerts
async function sendErrorAlert(error) {
  // Send email, Slack notification, or other alert
  console.log('ERROR ALERT:', error);
}

module.exports = router;
```

### Dependencies
- Story 4.1: Performance optimization for performance metrics
- Story 3.3: Duplicate prevention logic for user tracking
- Story 0.2: Firebase SDK integration for Firebase Analytics

### Testing
- Analytics events are tracked correctly
- User privacy is maintained (anonymized data)
- Performance metrics are captured
- Errors are logged and alerted
- Dashboard loads and displays data
- Real-time updates work
- API endpoints are secure
- Data is stored correctly
- Mobile tracking works
- Export functionality works

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