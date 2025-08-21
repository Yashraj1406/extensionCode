// Popup script for Tab Group Snapshots extension

document.addEventListener('DOMContentLoaded', async () => {
  await loadSnapshots();
  setupEventListeners();
});

// Load and display snapshots
async function loadSnapshots() {
  try {
    const { snapshots, isPro } = await chrome.storage.local.get(['snapshots', 'isPro']);
    
    updateStats(snapshots || [], isPro || false);
    displaySnapshots(snapshots || []);
    updateUpgradeBanner(snapshots || [], isPro || false);
  } catch (error) {
    console.error('Error loading snapshots:', error);
  }
}

// Update stats display
function updateStats(snapshots, isPro) {
  const statsEl = document.getElementById('stats');
  const count = snapshots.length;
  const limit = isPro ? '∞' : '5';
  statsEl.textContent = `${count} snapshots saved (${count}/${limit})`;
}

// Display snapshots in the list
function displaySnapshots(snapshots) {
  const listEl = document.getElementById('snapshotsList');
  const emptyEl = document.getElementById('emptyState');
  
  if (snapshots.length === 0) {
    listEl.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }
  
  emptyEl.style.display = 'none';
  
  // Sort snapshots by creation date (newest first)
  const sortedSnapshots = [...snapshots].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  listEl.innerHTML = sortedSnapshots.map(snapshot => `
    <div class="snapshot-item" data-id="${snapshot.id}">
      <div class="group-color" style="background-color: ${getGroupColor(snapshot.color)}"></div>
      <div class="snapshot-info">
        <div class="snapshot-name">${escapeHtml(snapshot.name)}</div>
        <div class="snapshot-meta">
          ${snapshot.tabCount} tabs • ${formatDate(snapshot.createdAt)}
        </div>
      </div>
      <div class="snapshot-actions">
        <button class="restore-btn" data-id="${snapshot.id}" title="Restore">🔄</button>
        <button class="delete-btn" data-id="${snapshot.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Snapshot item clicks (restore)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('restore-btn') || e.target.closest('.snapshot-item')) {
      const snapshotId = e.target.dataset.id || e.target.closest('.snapshot-item').dataset.id;
      if (snapshotId && !e.target.classList.contains('delete-btn')) {
        restoreSnapshot(snapshotId);
      }
    }
    
    // Delete button clicks
    if (e.target.classList.contains('delete-btn')) {
      e.stopPropagation();
      const snapshotId = e.target.dataset.id;
      if (confirm('Delete this snapshot?')) {
        deleteSnapshot(snapshotId);
      }
    }
    
    // Upgrade banner clicks
    if (e.target.closest('#upgradeBanner')) {
      handleUpgrade();
    }
  });
}

// Restore a snapshot
async function restoreSnapshot(snapshotId) {
  try {
    await chrome.runtime.sendMessage({
      action: 'restoreSnapshot',
      snapshotId: snapshotId
    });
    window.close();
  } catch (error) {
    console.error('Error restoring snapshot:', error);
  }
}

// Delete a snapshot
async function deleteSnapshot(snapshotId) {
  try {
    await chrome.runtime.sendMessage({
      action: 'deleteSnapshot',
      snapshotId: snapshotId
    });
    await loadSnapshots(); // Refresh the list
  } catch (error) {
    console.error('Error deleting snapshot:', error);
  }
}

// Handle upgrade to Pro
async function handleUpgrade() {
  // Open local payment page
  const paymentUrl = chrome.runtime.getURL('payment.html');
  chrome.tabs.create({ url: paymentUrl });
}

// Update upgrade banner visibility
function updateUpgradeBanner(snapshots, isPro) {
  const banner = document.getElementById('upgradeBanner');
  if (isPro || snapshots.length < 4) {
    banner.classList.add('hidden');
  } else {
    banner.classList.remove('hidden');
  }
}

// Get group color hex value
function getGroupColor(color) {
  const colors = {
    'grey': '#5f6368',
    'blue': '#1a73e8',
    'red': '#d93025',
    'yellow': '#fbbc04',
    'green': '#34a853',
    'pink': '#ff6d01',
    'purple': '#9aa0a6',
    'cyan': '#00acc1'
  };
  return colors[color] || colors.grey;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}