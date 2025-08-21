// Simple analytics for usage tracking (privacy-focused, local only)

class Analytics {
  static async track(event, data = {}) {
    try {
      const { analytics } = await chrome.storage.local.get(['analytics']);
      const currentAnalytics = analytics || {
        events: [],
        summary: {
          snapshotsTaken: 0,
          snapshotsRestored: 0,
          snapshotsDeleted: 0,
          upgradeClicks: 0,
          installDate: new Date().toISOString()
        }
      };

      // Add event
      currentAnalytics.events.push({
        event,
        data,
        timestamp: new Date().toISOString()
      });

      // Update summary
      if (event === 'snapshot_taken') currentAnalytics.summary.snapshotsTaken++;
      if (event === 'snapshot_restored') currentAnalytics.summary.snapshotsRestored++;
      if (event === 'snapshot_deleted') currentAnalytics.summary.snapshotsDeleted++;
      if (event === 'upgrade_clicked') currentAnalytics.summary.upgradeClicks++;

      // Keep only last 100 events to save space
      if (currentAnalytics.events.length > 100) {
        currentAnalytics.events = currentAnalytics.events.slice(-100);
      }

      await chrome.storage.local.set({ analytics: currentAnalytics });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static async getSummary() {
    try {
      const { analytics } = await chrome.storage.local.get(['analytics']);
      return analytics?.summary || {};
    } catch (error) {
      console.error('Analytics summary error:', error);
      return {};
    }
  }
}