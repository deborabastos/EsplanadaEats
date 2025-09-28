# Story 1.1: Project Setup & Basic Structure

**As a developer, I want the basic project structure with HTML, CSS, and JavaScript files organized, so that I have a foundation for building the application.**

## Overview
This story establishes the foundational project structure and basic file organization needed to support the Firebase-powered restaurant rating application.

## Acceptance Criteria

### AC 1.1: HTML file created with semantic structure and mobile viewport meta tag
- [ ] Create index.html with proper HTML5 doctype
- [ ] Include meta viewport tag for mobile responsiveness
- [ ] Implement semantic HTML structure (header, main, footer, etc.)
- [ ] Add Firebase SDK CDN links
- [ ] Include proper charset and language declarations
- [ ] Add accessibility attributes and ARIA labels

### AC 1.2: CSS file with mobile-first responsive grid system for restaurant cards
- [ ] Create styles.css with mobile-first approach
- [ ] Implement CSS Grid system for restaurant cards layout
- [ ] Create responsive breakpoints for different screen sizes
- [ ] Design 4-column grid for desktop, 1-column for mobile
- [ ] Include modern CSS features (CSS variables, flexbox, grid)
- [ ] Add basic styling for typography and colors

### AC 1.3: JavaScript file with modular structure separating concerns
- [ ] Create main.js as application entry point
- [ ] Implement modular JavaScript structure with ES6 modules
- [ ] Separate concerns into different modules (UI, data, services)
- [ ] Include proper error handling and logging
- [ ] Add event listeners for user interactions
- [ ] Implement clean code practices and documentation

### AC 1.4: Firebase integration module for data operations
- [ ] Create firebase.js module for Firebase initialization
- [ ] Implement data service module for restaurant operations
- [ ] Create authentication service module
- [ ] Add storage service module for file operations
- [ ] Implement real-time data synchronization
- [ ] Include proper error handling for Firebase operations

### AC 1.5: Project structure follows best practices for web applications with cloud backend
- [ ] Organize files in logical directory structure
- [ ] Include proper file naming conventions
- [ ] Add README.md with setup instructions
- [ ] Create .gitignore file for version control
- [ ] Implement basic development workflow
- [ ] Add documentation for project structure

## Technical Implementation Details

### HTML Structure (index.html)
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Esplanada Eats - Avalie restaurantes na Esplanada dos Ministérios">
    <title>Esplanada Eats</title>

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-storage-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>

    <!-- Application Styles -->
    <link rel="stylesheet" href="styles.css">

    <!-- Application Scripts -->
    <script type="module" src="js/main.js"></script>
</head>
<body>
    <header class="app-header" role="banner">
        <h1>Esplanada Eats</h1>
        <p>Avalie restaurantes na Esplanada dos Ministérios</p>
        <div id="connection-indicator" class="connection-indicator"></div>
    </header>

    <main class="app-main" role="main">
        <section class="restaurants-section" aria-labelledby="restaurants-heading">
            <div class="section-header">
                <h2 id="restaurants-heading">Restaurantes</h2>
                <button id="add-restaurant-btn" class="btn btn-primary" aria-label="Adicionar restaurante">
                    + Adicionar Restaurante
                </button>
            </div>

            <div id="restaurants-grid" class="restaurants-grid" role="list">
                <!-- Restaurant cards will be dynamically inserted here -->
            </div>

            <div id="empty-state" class="empty-state" style="display: none;">
                <p>Sem restaurantes cadastrados</p>
                <button class="btn btn-secondary">Seja o primeiro a adicionar!</button>
            </div>
        </section>
    </main>

    <footer class="app-footer" role="contentinfo">
        <p>&copy; 2024 Esplanada Eats</p>
    </footer>

    <!-- Modal Container -->
    <div id="modal-container" class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title" style="display: none;">
        <div class="modal-overlay" aria-hidden="true"></div>
        <div class="modal-content">
            <button class="modal-close" aria-label="Fechar modal">&times;</button>
            <div id="modal-body">
                <!-- Modal content will be dynamically inserted here -->
            </div>
        </div>
    </div>
</body>
</html>
```

### CSS Structure (styles.css)
```css
/* CSS Variables for theming */
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --success-color: #10b981;
    --error-color: #ef4444;
    --warning-color: #f59e0b;
    --background-color: #f8fafc;
    --surface-color: #ffffff;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Base styles and reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--background-color);
}

/* Mobile-first responsive grid system */
.restaurants-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
}

@media (min-width: 640px) {
    .restaurants-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .restaurants-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1280px) {
    .restaurants-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Utility classes */
.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #1d4ed8;
}

/* Restaurant card styles */
.restaurant-card {
    background-color: var(--surface-color);
    border-radius: 0.5rem;
    box-shadow: var(--shadow-sm);
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}

.restaurant-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

/* Modal styles */
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background-color: var(--surface-color);
    margin: 2rem auto;
    max-width: 500px;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
}

/* Connection indicator */
.connection-indicator {
    position: fixed;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 100;
}

.connection-indicator.online {
    background-color: var(--success-color);
    color: white;
}

.connection-indicator.offline {
    background-color: var(--error-color);
    color: white;
}
```

### JavaScript Module Structure
```javascript
// js/main.js - Entry point
import { initializeApp } from './modules/firebase.js';
import { RestaurantService } from './modules/restaurant-service.js';
import { UIService } from './modules/ui-service.js';
import { ModalService } from './modules/modal-service.js';
import { ConnectionManager } from './modules/connection-manager.js';

class App {
    constructor() {
        this.firebaseApp = null;
        this.restaurantService = null;
        this.uiService = null;
        this.modalService = null;
        this.connectionManager = null;
    }

    async initialize() {
        try {
            // Initialize Firebase
            this.firebaseApp = await initializeApp();

            // Initialize services
            this.restaurantService = new RestaurantService(this.firebaseApp);
            this.uiService = new UIService();
            this.modalService = new ModalService();
            this.connectionManager = new ConnectionManager();

            // Set up event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadRestaurants();

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Falha ao inicializar aplicação');
        }
    }

    setupEventListeners() {
        // Add restaurant button
        document.getElementById('add-restaurant-btn').addEventListener('click', () => {
            this.modalService.showAddRestaurantModal();
        });

        // Connection state changes
        this.connectionManager.onConnectionChange((isOnline) => {
            this.updateConnectionIndicator(isOnline);
        });
    }

    async loadRestaurants() {
        try {
            const restaurants = await this.restaurantService.getRestaurants();
            this.uiService.displayRestaurants(restaurants);
        } catch (error) {
            console.error('Failed to load restaurants:', error);
            this.showError('Falha ao carregar restaurantes');
        }
    }

    updateConnectionIndicator(isOnline) {
        const indicator = document.getElementById('connection-indicator');
        indicator.className = `connection-indicator ${isOnline ? 'online' : 'offline'}`;
        indicator.textContent = isOnline ? 'Online' : 'Offline';
    }

    showError(message) {
        // Implement error display logic
        alert(message); // Temporary - will be replaced with better UI
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});

export default App;
```

## Dependencies
- Epic 0: Firebase Integration (must be completed first)
- Firebase project configuration from Story 0.1
- Modern web browser with ES6 module support
- Basic understanding of HTML, CSS, and JavaScript

## Success Metrics
- HTML file loads correctly with proper semantic structure
- CSS responsive grid system works on all screen sizes
- JavaScript modules load and execute without errors
- Firebase services integrate properly with the application
- Project structure is organized and maintainable

## Testing Approach
1. **HTML Structure Test**: Validate HTML semantics and accessibility
2. **CSS Responsive Test**: Test layout on different screen sizes
3. **JavaScript Module Test**: Verify modules load and function correctly
4. **Integration Test**: Test Firebase integration with application
5. **Performance Test**: Measure load times and responsiveness

## Notes
- Uses modern web standards and best practices
- Mobile-first approach for responsive design
- Modular JavaScript structure for maintainability
- Includes proper error handling and user feedback
- Accessibility considerations built into the structure