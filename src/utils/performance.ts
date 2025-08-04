// Performance monitoring utilities for React components
interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, PerformanceEntry[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasurement(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }

  endMeasurement(name: string): void {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        const entry = performance.getEntriesByName(name, 'measure')[0];
        if (entry) {
          this.recordMeasurement(name, {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration,
            entryType: entry.entryType
          });
        }
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }

  private recordMeasurement(name: string, entry: PerformanceEntry): void {
    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    const entries = this.measurements.get(name)!;
    entries.push(entry);
    
    // Keep only last 50 measurements to prevent memory leaks
    if (entries.length > 50) {
      entries.shift();
    }
  }

  getAverageTime(name: string): number {
    const entries = this.measurements.get(name);
    if (!entries || entries.length === 0) return 0;
    
    const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
    return totalDuration / entries.length;
  }

  getStats(name: string) {
    const entries = this.measurements.get(name);
    if (!entries || entries.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    const durations = entries.map(e => e.duration);
    return {
      count: entries.length,
      average: this.getAverageTime(name),
      min: Math.min(...durations),
      max: Math.max(...durations)
    };
  }

  clearMeasurements(name?: string): void {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }

  logStats(): void {
    console.group('Performance Stats');
    for (const [name, entries] of this.measurements) {
      const stats = this.getStats(name);
      console.log(`${name}:`, {
        count: stats.count,
        average: `${stats.average.toFixed(2)}ms`,
        min: `${stats.min.toFixed(2)}ms`,
        max: `${stats.max.toFixed(2)}ms`
      });
    }
    console.groupEnd();
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();

  const startRender = () => monitor.startMeasurement(`${componentName}-render`);
  const endRender = () => monitor.endMeasurement(`${componentName}-render`);

  return { startRender, endRender };
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)
    };
  }
  return null;
};
