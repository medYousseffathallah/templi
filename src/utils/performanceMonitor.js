// Performance monitoring utility for Templi

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (this.isEnabled) {
      this.initializeObservers();
    }
  }

  // Initialize performance observers
  initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        // Navigation timing
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navObserver);

        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);

        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.recordMetric('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);

      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  // Record navigation metrics
  recordNavigationMetrics(entry) {
    const metrics = {
      'DNS_Lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'TCP_Connection': entry.connectEnd - entry.connectStart,
      'TLS_Negotiation': entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      'Request_Time': entry.responseStart - entry.requestStart,
      'Response_Time': entry.responseEnd - entry.responseStart,
      'DOM_Processing': entry.domComplete - entry.domLoading,
      'Load_Complete': entry.loadEventEnd - entry.loadEventStart,
      'Total_Load_Time': entry.loadEventEnd - entry.navigationStart
    };

    Object.entries(metrics).forEach(([key, value]) => {
      this.recordMetric(key, value);
    });
  }

  // Record resource metrics
  recordResourceMetrics(entry) {
    const resourceType = this.getResourceType(entry.name);
    const loadTime = entry.responseEnd - entry.startTime;
    
    this.recordMetric(`${resourceType}_Load_Time`, loadTime);
    
    // Track specific resource types
    if (resourceType === 'image') {
      this.recordMetric('Image_Count', 1, 'increment');
      this.recordMetric('Total_Image_Size', entry.transferSize || 0, 'sum');
    } else if (resourceType === 'script') {
      this.recordMetric('Script_Count', 1, 'increment');
      this.recordMetric('Total_Script_Size', entry.transferSize || 0, 'sum');
    } else if (resourceType === 'stylesheet') {
      this.recordMetric('CSS_Count', 1, 'increment');
      this.recordMetric('Total_CSS_Size', entry.transferSize || 0, 'sum');
    }
  }

  // Get resource type from URL
  getResourceType(url) {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      return 'image';
    } else if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
      return 'script';
    } else if (['css', 'scss', 'sass'].includes(extension)) {
      return 'stylesheet';
    } else if (['mp4', 'webm', 'ogg', 'avi'].includes(extension)) {
      return 'video';
    } else if (['woff', 'woff2', 'ttf', 'otf'].includes(extension)) {
      return 'font';
    }
    
    return 'other';
  }

  // Record a custom metric
  recordMetric(name, value, operation = 'set') {
    if (!this.isEnabled) return;
    
    const timestamp = performance.now();
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        values: [],
        sum: 0,
        count: 0,
        min: Infinity,
        max: -Infinity,
        avg: 0
      });
    }
    
    const metric = this.metrics.get(name);
    
    switch (operation) {
      case 'increment':
        metric.count += value;
        metric.sum += value;
        break;
      case 'sum':
        metric.sum += value;
        metric.count++;
        break;
      default: // 'set'
        metric.values.push({ value, timestamp });
        metric.sum += value;
        metric.count++;
        metric.min = Math.min(metric.min, value);
        metric.max = Math.max(metric.max, value);
        break;
    }
    
    metric.avg = metric.sum / metric.count;
    
    // Keep only last 100 values to prevent memory issues
    if (metric.values.length > 100) {
      metric.values = metric.values.slice(-100);
    }
  }

  // Start timing a custom operation
  startTiming(name) {
    if (!this.isEnabled) return null;
    
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        this.recordMetric(name, endTime - startTime);
        return endTime - startTime;
      }
    };
  }

  // Measure template loading performance
  measureTemplateLoad(templateId, operation) {
    if (!this.isEnabled) return null;
    
    const timer = this.startTiming(`Template_${operation}_Time`);
    
    return {
      end: () => {
        const duration = timer.end();
        this.recordMetric(`Template_${operation}_Count`, 1, 'increment');
        
        // Track slow operations
        if (duration > 1000) { // More than 1 second
          this.recordMetric(`Slow_Template_${operation}`, 1, 'increment');
        }
        
        return duration;
      }
    };
  }

  // Measure API call performance
  measureApiCall(endpoint, method = 'GET') {
    if (!this.isEnabled) return null;
    
    const timer = this.startTiming(`API_${method}_${endpoint}_Time`);
    
    return {
      end: (success = true) => {
        const duration = timer.end();
        this.recordMetric(`API_${method}_${endpoint}_Count`, 1, 'increment');
        
        if (success) {
          this.recordMetric(`API_${method}_${endpoint}_Success`, 1, 'increment');
        } else {
          this.recordMetric(`API_${method}_${endpoint}_Error`, 1, 'increment');
        }
        
        // Track slow API calls
        if (duration > 2000) { // More than 2 seconds
          this.recordMetric(`Slow_API_${method}_${endpoint}`, 1, 'increment');
        }
        
        return duration;
      }
    };
  }

  // Get performance summary
  getSummary() {
    if (!this.isEnabled) return {};
    
    const summary = {};
    
    this.metrics.forEach((metric, name) => {
      summary[name] = {
        count: metric.count,
        sum: metric.sum,
        avg: metric.avg,
        min: metric.min === Infinity ? 0 : metric.min,
        max: metric.max === -Infinity ? 0 : metric.max,
        latest: metric.values.length > 0 ? metric.values[metric.values.length - 1].value : 0
      };
    });
    
    return summary;
  }

  // Get Core Web Vitals
  getCoreWebVitals() {
    if (!this.isEnabled) return {};
    
    const vitals = {};
    
    ['LCP', 'FID', 'CLS'].forEach(vital => {
      if (this.metrics.has(vital)) {
        const metric = this.metrics.get(vital);
        vitals[vital] = {
          value: metric.avg,
          rating: this.getRating(vital, metric.avg)
        };
      }
    });
    
    return vitals;
  }

  // Get performance rating for Core Web Vitals
  getRating(metric, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 }
    };
    
    const threshold = thresholds[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // Log performance summary to console
  logSummary() {
    if (!this.isEnabled) return;
    
    console.group('🚀 Performance Summary');
    
    const vitals = this.getCoreWebVitals();
    if (Object.keys(vitals).length > 0) {
      console.group('📊 Core Web Vitals');
      Object.entries(vitals).forEach(([metric, data]) => {
        const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} ${metric}: ${data.value.toFixed(2)}ms (${data.rating})`);
      });
      console.groupEnd();
    }
    
    const summary = this.getSummary();
    const importantMetrics = [
      'Total_Load_Time',
      'Template_Load_Time',
      'API_GET_templates_Time',
      'Image_Count',
      'Total_Image_Size'
    ];
    
    console.group('📈 Key Metrics');
    importantMetrics.forEach(metric => {
      if (summary[metric]) {
        const data = summary[metric];
        console.log(`${metric}: ${data.avg.toFixed(2)}ms (avg), ${data.count} calls`);
      }
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  // Clear all metrics
  clear() {
    this.metrics.clear();
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const recordMetric = (name, value, operation) => performanceMonitor.recordMetric(name, value, operation);
export const startTiming = (name) => performanceMonitor.startTiming(name);
export const measureTemplateLoad = (templateId, operation) => performanceMonitor.measureTemplateLoad(templateId, operation);
export const measureApiCall = (endpoint, method) => performanceMonitor.measureApiCall(endpoint, method);
export const getSummary = () => performanceMonitor.getSummary();
export const getCoreWebVitals = () => performanceMonitor.getCoreWebVitals();
export const logSummary = () => performanceMonitor.logSummary();

export default performanceMonitor;