// Background script for Tab Group Snapshots extension
importScripts('analytics.js');

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
  initializeStorage();
});

// Create context menu for tab groups
function createContextMenu() {
  chrome.contextMenus.create({
    id: "takeSnapshot",
    title: "📸 Take Snapshot",
    contexts: ["page"],
    documentUrlPatterns: ["*://*/*"]
  });
}

// Initialize storage with default values
async function initializeStorage() {
  const result = await chrome.storage.local.get(['snapshots', 'isPro']);
  if (!result.snapshots) {
    await chrome.storage.local.set({ snapshots: [] });
  }
  if (result.isPro === undefined) {
    await chrome.storage.local.set({ isPro: false });
  }
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "takeSnapshot") {
    await takeSnapshotOfCurrentGroup(tab);
  }
});

// Take snapshot of the tab group containing the current tab
async function takeSnapshotOfCurrentGroup(tab) {
  try {
    // Check if tab is in a group
    if (tab.groupId === -1) {
      showNotification("This tab is not in a group", "error");
      return;
    }

    // Get tab group info
    const group = await chrome.tabGroups.get(tab.groupId);
    const groupTabs = await chrome.tabs.query({ groupId: tab.groupId });

    // Check free tier limits
    const { snapshots, isPro } = await chrome.storage.local.get(['snapshots', 'isPro']);
    if (!isPro && snapshots.length >= 5) {
      showNotification("Free tier limit reached. Upgrade to Pro for unlimited snapshots!", "upgrade");
      return;
    }

    // Create snapshot object
    const snapshot = {
      id: Date.now().toString(),
      name: group.title || `Group ${snapshots.length + 1}`,
      color: group.color,
      tabs: groupTabs.map(t => ({
        url: t.url,
        title: t.title,
        favIconUrl: t.favIconUrl
      })),
      createdAt: new Date().toISOString(),
      tabCount: groupTabs.length
    };

    // Save snapshot
    snapshots.push(snapshot);
    await chrome.storage.local.set({ snapshots });

    // Track analytics
    Analytics.track('snapshot_taken', {
      tabCount: snapshot.tabCount,
      groupColor: snapshot.color,
      totalSnapshots: snapshots.length
    });

    showNotification(`Snapshot "${snapshot.name}" saved!`, "success");
  } catch (error) {
    console.error('Error taking snapshot:', error);
    showNotification("Failed to take snapshot", "error");
  }
}

// Restore a snapshot
async function restoreSnapshot(snapshotId) {
  try {
    const { snapshots } = await chrome.storage.local.get(['snapshots']);
    const snapshot = snapshots.find(s => s.id === snapshotId);
    
    if (!snapshot) {
      showNotification("Snapshot not found", "error");
      return;
    }

    // Create new window
    const window = await chrome.windows.create({
      url: snapshot.tabs[0].url,
      focused: true
    });

    // Get the first tab to use for grouping
    const firstTab = (await chrome.tabs.query({ windowId: window.id }))[0];

    // Create remaining tabs
    const tabIds = [firstTab.id];
    for (let i = 1; i < snapshot.tabs.length; i++) {
      const tab = await chrome.tabs.create({
        windowId: window.id,
        url: snapshot.tabs[i].url,
        active: false
      });
      tabIds.push(tab.id);
    }

    // Group all tabs
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, {
      title: snapshot.name,
      color: snapshot.color
    });

    Analytics.track('snapshot_restored', {
      tabCount: snapshot.tabCount,
      snapshotAge: Date.now() - new Date(snapshot.createdAt).getTime()
    });

    showNotification(`Restored "${snapshot.name}"`, "success");
  } catch (error) {
    console.error('Error restoring snapshot:', error);
    showNotification("Failed to restore snapshot", "error");
  }
}

// Show notification
function showNotification(message, type = "info") {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: "Tab Group Snapshots",
    message: message
  });
}

// Listen for keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "take-snapshot") {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      await takeSnapshotOfCurrentGroup(activeTab);
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "restoreSnapshot") {
    restoreSnapshot(request.snapshotId);
  } else if (request.action === "deleteSnapshot") {
    deleteSnapshot(request.snapshotId);
  }
});

// Delete a snapshot
async function deleteSnapshot(snapshotId) {
  try {
    const { snapshots } = await chrome.storage.local.get(['snapshots']);
    const updatedSnapshots = snapshots.filter(s => s.id !== snapshotId);
    await chrome.storage.local.set({ snapshots: updatedSnapshots });
    showNotification("Snapshot deleted", "success");
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    showNotification("Failed to delete snapshot", "error");
  }
}