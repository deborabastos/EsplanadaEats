// js/utils/performance-test.js - Performance testing and benchmarking utilities

/**
 * PerformanceTest - Comprehensive performance testing for the application
 */
export class PerformanceTest {
    constructor() {
        this.results = [];
        this.testConfig = {
            iterations: 5,
            warmupIterations: 2,
            timeout: 10000 // 10 seconds
        };
    }

    /**
     * Run all performance tests
     * @returns {Promise<Object>} Test results
     */
    async runAllTests() {
        console.log('🧪 Starting comprehensive performance tests...');

        const testSuite = {
            imageLoading: () => this.testImageLoading(),
            firebaseQueries: () => this.testFirebaseQueries(),
            domOperations: () => this.testDOMOperations(),
            animations: () => this.testAnimations(),
            memoryUsage: () => this.testMemoryUsage(),
            bundleLoading: () => this.testBundleLoading(),
            scrollPerformance: () => this.testScrollPerformance(),
            ratingDisplay: () => this.testRatingDisplayPerformance()
        };

        const results = {};

        for (const [testName, testFn] of Object.entries(testSuite)) {
            try {
                console.log(`🔄 Running ${testName} test...`);
                results[testName] = await this.runTest(testName, testFn);
            } catch (error) {
                console.error(`❌ ${testName} test failed:`, error);
                results[testName] = {
                    status: 'failed',
                    error: error.message,
                    duration: 0
                };
            }
        }

        this.results = results;
        console.log('✅ Performance tests completed:', results);
        return results;
    }

    /**
     * Run a single test with multiple iterations
     * @param {string} testName - Name of the test
     * @param {Function} testFn - Test function
     * @returns {Promise<Object>} Test result
     */
    async runTest(testName, testFn) {
        const results = {
            iterations: [],
            average: 0,
            min: Infinity,
            max: 0,
            status: 'completed'
        };

        // Warmup iterations
        for (let i = 0; i < this.testConfig.warmupIterations; i++) {
            try {
                await testFn();
            } catch (error) {
                // Ignore warmup errors
            }
        }

        // Actual test iterations
        for (let i = 0; i < this.testConfig.iterations; i++) {
            const startTime = performance.now();

            try {
                const testResult = await Promise.race([
                    testFn(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Test timeout')), this.testConfig.timeout)
                    )
                ]);

                const duration = performance.now() - startTime;
                results.iterations.push({ duration, success: true, result: testResult });
                results.min = Math.min(results.min, duration);
                results.max = Math.max(results.max, duration);

            } catch (error) {
                const duration = performance.now() - startTime;
                results.iterations.push({ duration, success: false, error: error.message });
                results.status = 'partial';
            }
        }

        // Calculate average
        const successfulIterations = results.iterations.filter(iter => iter.success);
        if (successfulIterations.length > 0) {
            results.average = successfulIterations.reduce((sum, iter) => sum + iter.duration, 0) / successfulIterations.length;
        } else {
            results.status = 'failed';
        }

        return results;
    }

    /**
     * Test image loading performance
     * @returns {Promise<Object>} Image loading test result
     */
    async testImageLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) {
            return { message: 'No lazy-loadable images found', imageCount: 0 };
        }

        const startTime = performance.now();
        const loadedPromises = Array.from(images).map(img => {
            return new Promise((resolve) => {
                const originalOnLoad = img.onload;
                const originalOnError = img.onerror;

                img.onload = () => {
                    if (originalOnLoad) originalOnLoad();
                    resolve({ success: true, src: img.dataset.src });
                };

                img.onerror = () => {
                    if (originalOnError) originalOnError();
                    resolve({ success: false, src: img.dataset.src });
                };

                // Trigger image load
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                } else {
                    resolve({ success: false, src: 'missing' });
                }
            });
        });

        const results = await Promise.all(loadedPromises);
        const duration = performance.now() - startTime;

        return {
            imageCount: images.length,
            successCount: results.filter(r => r.success).length,
            failureCount: results.filter(r => !r.success).length,
            averageLoadTime: duration / images.length,
            totalLoadTime: duration
        };
    }

    /**
     * Test Firebase query performance
     * @returns {Promise<Object>} Firebase query test result
     */
    async testFirebaseQueries() {
        if (!window.firebase) {
            return { message: 'Firebase not available' };
        }

        const queries = [
            {
                name: 'restaurants_query',
                fn: () => firebase.firestore().collection('restaurants').limit(10).get()
            },
            {
                name: 'ratings_query',
                fn: () => firebase.firestore().collection('ratings').limit(5).get()
            }
        ];

        const results = {};

        for (const query of queries) {
            const startTime = performance.now();
            try {
                const snapshot = await query.fn();
                const duration = performance.now() - startTime;
                results[query.name] = {
                    duration,
                    documentCount: snapshot.docs.length,
                    success: true
                };
            } catch (error) {
                const duration = performance.now() - startTime;
                results[query.name] = {
                    duration,
                    error: error.message,
                    success: false
                };
            }
        }

        return results;
    }

    /**
     * Test DOM manipulation performance
     * @returns {Promise<Object>} DOM operations test result
     */
    async testDOMOperations() {
        const testContainer = document.createElement('div');
        testContainer.style.display = 'none';
        document.body.appendChild(testContainer);

        const results = {};

        // Test element creation
        const createElementStart = performance.now();
        for (let i = 0; i < 1000; i++) {
            const div = document.createElement('div');
            div.textContent = `Element ${i}`;
            testContainer.appendChild(div);
        }
        results.createElementTime = performance.now() - createElementStart;

        // Test element removal
        const removeElementStart = performance.now();
        testContainer.innerHTML = '';
        results.removeElementTime = performance.now() - removeElementStart;

        // Test query selector
        const queryStart = performance.now();
        for (let i = 0; i < 100; i++) {
            document.querySelectorAll('.restaurant-card');
        }
        results.queryTime = performance.now() - queryStart;

        document.body.removeChild(testContainer);
        return results;
    }

    /**
     * Test animation performance
     * @returns {Promise<Object>} Animation test result
     */
    async testAnimations() {
        const testElement = document.createElement('div');
        testElement.style.cssText = `
            position: fixed;
            top: -100px;
            left: -100px;
            width: 100px;
            height: 100px;
            background: red;
            transform: translateZ(0);
        `;
        document.body.appendChild(testElement);

        const results = {};

        // Test CSS transition
        const transitionStart = performance.now();
        testElement.style.transform = 'translateX(100px)';

        await new Promise(resolve => {
            testElement.addEventListener('transitionend', resolve, { once: true });
        });

        results.transitionTime = performance.now() - transitionStart;

        // Test animation frame
        const frameStart = performance.now();
        let frames = 0;
        const animate = () => {
            frames++;
            if (frames < 60) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);

        await new Promise(resolve => setTimeout(resolve, 1000));
        results.frameRate = frames;
        results.animationTime = performance.now() - frameStart;

        document.body.removeChild(testElement);
        return results;
    }

    /**
     * Test memory usage
     * @returns {Object} Memory usage test result
     */
    testMemoryUsage() {
        if (!performance.memory) {
            return { message: 'Memory API not available' };
        }

        const memory = performance.memory;
        return {
            usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100, // MB
            totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100, // MB
            jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100, // MB
            usedPercentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 * 100) / 100
        };
    }

    /**
     * Test bundle loading performance
     * @returns {Promise<Object>} Bundle loading test result
     */
    async testBundleLoading() {
        const modules = [
            { name: 'ImageLoader', path: '/js/utils/image-loader.js' },
            { name: 'BundleOptimizer', path: '/js/utils/bundle-optimizer.js' },
            { name: 'PerformanceMonitor', path: '/js/services/performance-monitor.js' }
        ];

        const results = {};

        for (const module of modules) {
            const startTime = performance.now();
            try {
                const imported = await import(module.path);
                const duration = performance.now() - startTime;
                results[module.name] = {
                    duration,
                    success: true,
                    exports: Object.keys(imported).length
                };
            } catch (error) {
                const duration = performance.now() - startTime;
                results[module.name] = {
                    duration,
                    success: false,
                    error: error.message
                };
            }
        }

        return results;
    }

    /**
     * Test scroll performance
     * @returns {Promise<Object>} Scroll test result
     */
    async testScrollPerformance() {
        const scrollContainer = document.querySelector('.restaurants-grid') || document.body;

        if (scrollContainer.scrollHeight <= scrollContainer.clientHeight) {
            return { message: 'Content not scrollable' };
        }

        const results = {};
        const scrollDistance = Math.min(500, scrollContainer.scrollHeight - scrollContainer.clientHeight);

        // Test scroll down
        const scrollDownStart = performance.now();
        scrollContainer.scrollBy({ top: scrollDistance, behavior: 'smooth' });

        await new Promise(resolve => {
            const checkScroll = () => {
                if (Math.abs(scrollContainer.scrollTop % scrollDistance) < 10) {
                    resolve();
                } else {
                    requestAnimationFrame(checkScroll);
                }
            };
            checkScroll();
        });

        results.scrollDownTime = performance.now() - scrollDownStart;

        // Test scroll up
        const scrollUpStart = performance.now();
        scrollContainer.scrollBy({ top: -scrollDistance, behavior: 'smooth' });

        await new Promise(resolve => {
            const checkScroll = () => {
                if (Math.abs(scrollContainer.scrollTop % scrollDistance) < 10) {
                    resolve();
                } else {
                    requestAnimationFrame(checkScroll);
                }
            };
            checkScroll();
        });

        results.scrollUpTime = performance.now() - scrollUpStart;

        return results;
    }

    /**
     * Test rating display component performance
     * @returns {Promise<Object>} Rating display test result
     */
    async testRatingDisplayPerformance() {
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);

        const testCases = Array.from({ length: 100 }, (_, i) => ({
            averageQuality: Math.random() * 5,
            totalRatings: Math.floor(Math.random() * 1000),
            confidenceScore: Math.random(),
            isOffline: Math.random() > 0.5
        }));

        const startTime = performance.now();

        // Dynamic import to test module loading and rendering
        try {
            const { RatingDisplay } = await import('/js/components/rating-display.js');

            testCases.forEach((testCase, index) => {
                const div = document.createElement('div');
                RatingDisplay.renderCompact(testCase, div);
                container.appendChild(div);
            });

            const duration = performance.now() - startTime;

            document.body.removeChild(container);

            return {
                renderTime: duration,
                averageTimePerComponent: duration / testCases.length,
                componentCount: testCases.length,
                success: true
            };
        } catch (error) {
            document.body.removeChild(container);
            return {
                success: false,
                error: error.message,
                componentCount: testCases.length
            };
        }
    }

    /**
     * Generate performance report
     * @returns {string} HTML performance report
     */
    generateReport() {
        if (this.results.length === 0) {
            return '<p>No test results available</p>';
        }

        let html = `
            <div class="performance-test-report">
                <h3>Performance Test Report</h3>
                <div class="test-summary">
                    <div class="summary-item">
                        <label>Total Tests:</label>
                        <span>${Object.keys(this.results).length}</span>
                    </div>
                    <div class="summary-item">
                        <label>Passed:</label>
                        <span>${Object.values(this.results).filter(r => r.status === 'completed').length}</span>
                    </div>
                    <div class="summary-item">
                        <label>Failed:</label>
                        <span>${Object.values(this.results).filter(r => r.status === 'failed').length}</span>
                    </div>
                </div>
                <div class="test-details">
        `;

        for (const [testName, result] of Object.entries(this.results)) {
            const statusClass = result.status === 'completed' ? 'success' :
                              result.status === 'partial' ? 'warning' : 'error';

            html += `
                <div class="test-result ${statusClass}">
                    <h4>${testName}</h4>
                    <div class="test-metrics">
                        <span class="status">Status: ${result.status}</span>
                        <span class="duration">Duration: ${result.average?.toFixed(2) || 'N/A'}ms</span>
                    </div>
                    <div class="test-data">
                        <pre>${JSON.stringify(result, null, 2)}</pre>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Get performance score
     * @returns {number} Performance score (0-100)
     */
    getPerformanceScore() {
        if (this.results.length === 0) {
            return 0;
        }

        let totalScore = 0;
        let testCount = 0;

        for (const [testName, result] of Object.entries(this.results)) {
            if (result.status === 'completed') {
                let testScore = 100;

                // Score based on performance thresholds
                if (result.average) {
                    if (testName === 'imageLoading' && result.average > 1000) testScore = 60;
                    if (testName === 'domOperations' && result.average > 100) testScore = 70;
                    if (testName === 'animations' && result.frameRate < 60) testScore = 50;
                    if (testName === 'bundleLoading' && result.average > 500) testScore = 60;
                }

                totalScore += testScore;
                testCount++;
            } else if (result.status === 'partial') {
                totalScore += 50;
                testCount++;
            }
        }

        return testCount > 0 ? Math.round(totalScore / testCount) : 0;
    }
}

// Create global test instance
export const performanceTest = new PerformanceTest();

/**
 * Run quick performance check
 * @returns {Promise<Object>} Quick test results
 */
export async function runQuickPerformanceCheck() {
    console.log('⚡ Running quick performance check...');

    const test = new PerformanceTest();
    test.testConfig.iterations = 1;
    test.testConfig.warmupIterations = 0;

    const quickTests = {
        memory: () => test.testMemoryUsage(),
        domOperations: () => test.testDOMOperations(),
        ratingDisplay: () => test.testRatingDisplayPerformance()
    };

    const results = {};
    for (const [name, testFn] of Object.entries(quickTests)) {
        try {
            results[name] = await test.runTest(name, testFn);
        } catch (error) {
            results[name] = { status: 'failed', error: error.message };
        }
    }

    return results;
}