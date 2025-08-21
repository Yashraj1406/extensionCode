// Options page script

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  try {
    const { snapshots, isPro, analytics } = await chrome.storage.local.get(['snapshots', 'isPro', 'analytics']);
    
    // Update stats
    const stats = analytics?.summary || {};
    document.getElementById('snapshotsTaken').textContent = stats.snapshotsTaken || 0;
    document.getElementById('snapshotsRestored').textContent = stats.snapshotsRestored || 0;
    document.getElementById('totalSnapshots').textContent = (snapshots || []).length;
    
    // Update account status
    const planStatus = isPro ? 'Pro (Unlimited snapshots)' : 'Free (5 snapshots max)';
    document.getElementById('planStatus').textContent = planStatus;
    
    const installDate = stats.installDate ? new Date(stats.installDate).toLocaleDateString() : 'Unknown';
    document.getElementById('memberSince').textContent = installDate;
    
    // Update UI based on pro status
    if (isPro) {
      document.getElementById('upgradeBtn').style.display = 'none';
      document.querySelectorAll('.pro-feature').forEach(el => {
        el.classList.remove('pro-feature');
        el.querySelector('input, button').disabled = false;
      });
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function setupEventListeners() {
  // Upgrade button
  document.getElementById('upgradeBtn').addEventListener('click', handleUpgrade);
  
  // Activate license key
  document.getElementById('activateBtn').addEventListener('click', activateLicense);
  
  // Export button
  document.getElementById('exportBtn').addEventListener('click', exportSnapshots);
  
  // Import button
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  
  document.getElementById('importFile').addEventListener('change', importSnapshots);
  
  // Clear all button
  document.getElementById('clearBtn').addEventListener('click', clearAllData);
}

async function handleUpgrade() {
  // Open local payment page
  const paymentUrl = chrome.runtime.getURL('payment.html');
  chrome.tabs.create({ url: paymentUrl });
}

async function exportSnapshots() {
  try {
    const { snapshots } = await chrome.storage.local.get(['snapshots']);
    const dataStr = JSON.stringify(snapshots || [], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tab-group-snapshots-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export snapshots');
  }
}

async function importSnapshots(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const text = await file.text();
    const importedSnapshots = JSON.parse(text);
    
    if (!Array.isArray(importedSnapshots)) {
      throw new Error('Invalid file format');
    }
    
    const { snapshots } = await chrome.storage.local.get(['snapshots']);
    const currentSnapshots = snapshots || [];
    
    // Merge snapshots (avoid duplicates by ID)
    const existingIds = new Set(currentSnapshots.map(s => s.id));
    const newSnapshots = importedSnapshots.filter(s => !existingIds.has(s.id));
    
    const mergedSnapshots = [...currentSnapshots, ...newSnapshots];
    await chrome.storage.local.set({ snapshots: mergedSnapshots });
    
    alert(`Imported ${newSnapshots.length} new snapshots`);
    await loadSettings();
  } catch (error) {
    console.error('Import error:', error);
    alert('Failed to import snapshots. Please check the file format.');
  }
  
  // Reset file input
  event.target.value = '';
}

async function activateLicense() {
  const licenseKey = document.getElementById('licenseKey').value.trim();
  
  if (!licenseKey) {
    alert('Please enter a license key');
    return;
  }
  
  // Validate license cryptographically
  if (validateLicense(licenseKey)) {
    await chrome.storage.local.set({ isPro: true, licenseKey });
    alert('Pro activated successfully! 🎉');
    await loadSettings();
    document.getElementById('licenseKey').value = '';
  } else {
    alert('Invalid license key. Please check and try again.');
  }
}

// Validate license key cryptographically
function validateLicense(licenseKey) {
  try {
    if (!licenseKey.startsWith('PRO-')) return false;
    
    const encoded = licenseKey.substring(4);
    const decoded = atob(encoded + '==');
    const parts = decoded.split('-');
    
    if (parts.length !== 3) return false;
    
    const [paymentId, timestamp, signature] = parts;
    const data = `${paymentId}-${timestamp}`;
    const expectedSignature = createSignature(data);
    
    // Verify signature
    if (signature !== expectedSignature) return false;
    
    // Check if license is not too old (1 year max)
    const licenseAge = Date.now() - parseInt(timestamp);
    const maxAge = 365 * 24 * 60 * 60 * 1000;
    
    return licenseAge < maxAge;
  } catch (error) {
    return false;
  }
}

// Create signature (same as payment.js)
function createSignature(data) {
  const SECRET_KEY = 'TabSnaps2024SecretKey';
  let hash = 0;
  const combined = data + SECRET_KEY;
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

async function clearAllData() {
  const confirmed = confirm('Are you sure you want to clear ALL data?\n\nThis will delete:\n• All snapshots\n• Settings\n• Usage statistics\n\nThis action cannot be undone.');
  
  if (confirmed) {
    await chrome.storage.local.clear();
    alert('All data cleared');
    await loadSettings();
  }
}