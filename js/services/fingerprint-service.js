// js/services/fingerprint-service.js - Browser fingerprinting for user identification

/**
 * Fingerprint Service - Generates unique browser fingerprints for user identification
 */
export class FingerprintService {
    constructor() {
        this.fingerprint = null;
        this.fingerprintData = {};
        console.log('FingerprintService initialized');
    }

    /**
     * Generate browser fingerprint
     * @returns {Promise<Object>} Fingerprint data with hash
     */
    async generateFingerprint() {
        try {
            console.log('Generating browser fingerprint...');

            // Collect all fingerprint data
            const data = {
                userAgent: navigator.userAgent,
                screen: this.getScreenData(),
                timezone: this.getTimezoneData(),
                language: this.getLanguageData(),
                platform: navigator.platform,
                hardware: this.getHardwareData(),
                webgl: this.getWebGLData(),
                canvas: await this.getCanvasFingerprint(),
                audio: await this.getAudioFingerprint(),
                fonts: this.getFontsData(),
                storage: this.getStorageData(),
                date: Date.now()
            };

            // Generate hash from the data
            const hash = await this.generateHash(data);

            this.fingerprintData = data;
            this.fingerprint = hash;

            console.log('Fingerprint generated successfully:', hash);
            console.log('Fingerprint data collected:', Object.keys(data));

            return {
                hash,
                data,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Failed to generate fingerprint:', error);
            return this.getFallbackFingerprint();
        }
    }

    /**
     * Get screen resolution and color depth data
     * @returns {Object} Screen information
     */
    getScreenData() {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }

    /**
     * Get timezone information
     * @returns {Object} Timezone data
     */
    getTimezoneData() {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset();

        return {
            offset: timezoneOffset,
            name: Intl.DateTimeFormat().resolvedOptions().timeZone,
            offsetString: this.formatTimezoneOffset(timezoneOffset)
        };
    }

    /**
     * Format timezone offset as string
     * @param {number} offset - Minutes offset from UTC
     * @returns {string} Formatted offset (e.g., "-03:00")
     */
    formatTimezoneOffset(offset) {
        const hours = Math.floor(Math.abs(offset) / 60);
        const minutes = Math.abs(offset) % 60;
        const sign = offset <= 0 ? '+' : '-';
        return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * Get language and locale information
     * @returns {Object} Language data
     */
    getLanguageData() {
        return {
            language: navigator.language,
            languages: navigator.languages || [],
            locale: Intl.DateTimeFormat().resolvedOptions().locale
        };
    }

    /**
     * Get hardware and platform information
     * @returns {Object} Hardware data
     */
    getHardwareData() {
        return {
            cpuCores: navigator.hardwareConcurrency || 'unknown',
            memory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            vendor: navigator.vendor || 'unknown',
            connection: this.getConnectionData()
        };
    }

    /**
     * Get network connection information
     * @returns {Object|null} Connection data
     */
    getConnectionData() {
        if (!navigator.connection) return null;

        return {
            effectiveType: navigator.connection.effectiveType || 'unknown',
            downlink: navigator.connection.downlink || 'unknown',
            rtt: navigator.connection.rtt || 'unknown'
        };
    }

    /**
     * Get WebGL renderer information
     * @returns {Object} WebGL data
     */
    getWebGLData() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) {
                return { available: false };
            }

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

            const data = {
                available: true,
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
            };

            if (debugInfo) {
                data.unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                data.unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }

            return data;

        } catch (error) {
            console.warn('Failed to get WebGL data:', error);
            return { available: false, error: error.message };
        }
    }

    /**
     * Generate canvas fingerprint
     * @returns {Promise<string>} Canvas fingerprint hash
     */
    async getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = 200;
            canvas.height = 50;

            // Draw complex shapes
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';

            // Add some text
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);

            ctx.fillStyle = '#069';
            ctx.fillText('Canvas fingerprint 🎨', 2, 15);

            // Add some shapes
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.beginPath();
            ctx.moveTo(50, 30);
            ctx.lineTo(70, 40);
            ctx.lineTo(90, 20);
            ctx.lineTo(110, 35);
            ctx.lineTo(130, 25);
            ctx.closePath();
            ctx.fill();

            // Get canvas data URL
            const dataUrl = canvas.toDataURL();

            // Generate hash from canvas data
            return await this.generateHash(dataUrl);

        } catch (error) {
            console.warn('Failed to generate canvas fingerprint:', error);
            return 'canvas-error';
        }
    }

    /**
     * Generate audio context fingerprint
     * @returns {Promise<string>} Audio fingerprint hash
     */
    async getAudioFingerprint() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                return 'audio-not-supported';
            }

            const context = new AudioContext();
            const oscillator = context.createOscillator();
            const analyser = context.createAnalyser();
            const gainNode = context.createGain();
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

            gainNode.gain.setValueAtTime(0, context.currentTime);

            oscillator.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start(0);

            // Collect audio data
            const audioData = [];
            scriptProcessor.onaudioprocess = (event) => {
                const data = event.inputBuffer.getChannelData(0);
                for (let i = 0; i < data.length; i++) {
                    audioData.push(data[i]);
                }
            };

            // Wait a bit for data collection
            await new Promise(resolve => setTimeout(resolve, 100));

            oscillator.stop();
            context.close();

            // Generate hash from audio data
            const sample = audioData.slice(0, 100); // Use first 100 samples
            return await this.generateHash(sample.join(','));

        } catch (error) {
            console.warn('Failed to generate audio fingerprint:', error);
            return 'audio-error';
        }
    }

    /**
     * Get available fonts detection
     * @returns {Array} Available fonts list
     */
    getFontsData() {
        const testFonts = [
            'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
            'Helvetica', 'Impact', 'Times New Roman', 'Trebuchet MS', 'Verdana',
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
            'Ubuntu', 'Playfair Display', 'Merriweather', 'Oswald'
        ];

        const availableFonts = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        testFonts.forEach(font => {
            ctx.font = `72px monospace`;
            const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;

            ctx.font = `72px '${font}', monospace`;
            const testWidth = ctx.measureText('mmmmmmmmmmlli').width;

            if (baseWidth !== testWidth) {
                availableFonts.push(font);
            }
        });

        return availableFonts;
    }

    /**
     * Get storage capabilities
     * @returns {Object} Storage data
     */
    getStorageData() {
        try {
            return {
                localStorage: typeof Storage !== 'undefined',
                sessionStorage: typeof sessionStorage !== 'undefined',
                indexedDB: typeof indexedDB !== 'undefined',
                cookies: navigator.cookieEnabled
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    /**
     * Generate hash from data
     * @param {*} data - Data to hash
     * @returns {Promise<string>} Hash string
     */
    async generateHash(data) {
        try {
            const string = typeof data === 'string' ? data : JSON.stringify(data);

            // Use SubtleCrypto API if available
            if (crypto.subtle) {
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(string);
                const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            // Fallback: Simple hash function
            return this.simpleHash(string);

        } catch (error) {
            console.warn('Hash generation failed, using fallback:', error);
            return this.simpleHash(JSON.stringify(data));
        }
    }

    /**
     * Simple hash function fallback
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    simpleHash(str) {
        let hash = 0;
        if (str.length === 0) return hash.toString();

        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }

        return Math.abs(hash).toString(16);
    }

    /**
     * Get fallback fingerprint when main methods fail
     * @returns {Object} Basic fingerprint data
     */
    getFallbackFingerprint() {
        const basicData = {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            platform: navigator.platform,
            timestamp: Date.now()
        };

        const hash = this.simpleHash(JSON.stringify(basicData));

        console.log('Using fallback fingerprint:', hash);

        return {
            hash,
            data: basicData,
            fallback: true,
            timestamp: Date.now()
        };
    }

    /**
     * Get current fingerprint
     * @returns {string|null} Current fingerprint hash
     */
    getFingerprint() {
        return this.fingerprint;
    }

    /**
     * Get fingerprint data
     * @returns {Object} Complete fingerprint data
     */
    getFingerprintData() {
        return this.fingerprintData;
    }

    /**
     * Check if fingerprint is generated
     * @returns {boolean} True if fingerprint exists
     */
    hasFingerprint() {
        return this.fingerprint !== null;
    }
}

export default FingerprintService;