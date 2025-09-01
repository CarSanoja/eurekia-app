import Dexie from 'dexie';

// Initialize IndexedDB database using Dexie
const db = new Dexie('QuantaDB');

// Define database schema
db.version(1).stores({
  habits: 'id, user_id, title, cadence, difficulty_level, is_active, created_at, updated_at, synced',
  checkins: 'id, habit_id, date, value, note, created_at, synced',
  moods: 'id, user_id, date, score, note, created_at, synced',
  missions: 'id, user_id, skill, weakness, created_at, updated_at, synced',
  visions: 'id, user_id, tags, summary, image_url, created_at, updated_at, synced',
  badges: 'id, user_id, type, awarded_at, metadata, synced',
  pendingActions: '++id, action_type, data, timestamp, retries',
  syncQueue: '++id, entity, entity_id, action, data, timestamp'
});

// Offline storage service
class OfflineStorage {
  constructor() {
    this.db = db;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  // Connection status handlers
  handleOnline() {
    this.isOnline = true;
    console.log('🌐 Back online - starting sync...');
    this.syncWithBackend();
  }
  
  handleOffline() {
    this.isOnline = false;
    console.log('📴 Offline mode activated');
  }
  
  // Habits operations
  async saveHabit(habit) {
    const habitData = {
      ...habit,
      synced: this.isOnline,
      updated_at: new Date().toISOString()
    };
    
    await this.db.habits.put(habitData);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('habits', habit.id, 'update', habitData);
    }
    
    return habitData;
  }
  
  async getHabits(userId) {
    return await this.db.habits
      .where('user_id')
      .equals(userId)
      .and(habit => habit.is_active)
      .toArray();
  }
  
  async deleteHabit(habitId) {
    await this.db.habits.delete(habitId);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('habits', habitId, 'delete', { id: habitId });
    }
  }
  
  // Checkins operations
  async saveCheckin(checkin) {
    const checkinData = {
      ...checkin,
      synced: this.isOnline,
      created_at: new Date().toISOString()
    };
    
    await this.db.checkins.put(checkinData);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('checkins', checkin.id, 'create', checkinData);
    }
    
    return checkinData;
  }
  
  async getCheckins(habitId, startDate, endDate) {
    return await this.db.checkins
      .where('habit_id')
      .equals(habitId)
      .and(checkin => {
        const date = new Date(checkin.date);
        return date >= startDate && date <= endDate;
      })
      .toArray();
  }
  
  // Moods operations
  async saveMood(mood) {
    const moodData = {
      ...mood,
      synced: this.isOnline,
      created_at: new Date().toISOString()
    };
    
    await this.db.moods.put(moodData);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('moods', mood.id, 'create', moodData);
    }
    
    return moodData;
  }
  
  async getMoods(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await this.db.moods
      .where('user_id')
      .equals(userId)
      .and(mood => new Date(mood.date) >= startDate)
      .toArray();
  }
  
  // Mission operations
  async saveMission(mission) {
    const missionData = {
      ...mission,
      synced: this.isOnline,
      updated_at: new Date().toISOString()
    };
    
    await this.db.missions.put(missionData);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('missions', mission.id, 'update', missionData);
    }
    
    return missionData;
  }
  
  async getMission(userId) {
    return await this.db.missions
      .where('user_id')
      .equals(userId)
      .first();
  }
  
  // Vision operations
  async saveVision(vision) {
    const visionData = {
      ...vision,
      synced: this.isOnline,
      updated_at: new Date().toISOString()
    };
    
    await this.db.visions.put(visionData);
    
    if (!this.isOnline) {
      await this.addToSyncQueue('visions', vision.id, 'update', visionData);
    }
    
    return visionData;
  }
  
  async getVision(userId) {
    return await this.db.visions
      .where('user_id')
      .equals(userId)
      .first();
  }
  
  // Badges operations
  async saveBadges(badges) {
    const badgeData = badges.map(badge => ({
      ...badge,
      synced: true
    }));
    
    await this.db.badges.bulkPut(badgeData);
    return badgeData;
  }
  
  async getBadges(userId) {
    return await this.db.badges
      .where('user_id')
      .equals(userId)
      .toArray();
  }
  
  // Sync queue management
  async addToSyncQueue(entity, entityId, action, data) {
    await this.db.syncQueue.add({
      entity,
      entity_id: entityId,
      action,
      data,
      timestamp: new Date().toISOString()
    });
  }
  
  async getSyncQueue() {
    return await this.db.syncQueue.toArray();
  }
  
  async clearSyncQueue(ids) {
    await this.db.syncQueue.bulkDelete(ids);
  }
  
  // Sync with backend
  async syncWithBackend() {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }
    
    this.syncInProgress = true;
    console.log('🔄 Starting sync with backend...');
    
    try {
      const queue = await this.getSyncQueue();
      const syncedIds = [];
      
      for (const item of queue) {
        try {
          await this.syncItem(item);
          syncedIds.push(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }
      
      // Clear successfully synced items
      if (syncedIds.length > 0) {
        await this.clearSyncQueue(syncedIds);
        console.log(`✅ Synced ${syncedIds.length} items`);
      }
      
      // Mark all local items as synced
      await this.markAllAsSynced();
      
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  async syncItem(item) {
    const { entity, action, data } = item;
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    let url = `/api/${entity}/`;
    let method = 'POST';
    
    if (action === 'update') {
      url += `${data.id}/`;
      method = 'PUT';
    } else if (action === 'delete') {
      url += `${data.id}/`;
      method = 'DELETE';
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'DELETE' ? JSON.stringify(data) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    return response.json();
  }
  
  async markAllAsSynced() {
    // Mark habits as synced
    await this.db.habits.toCollection().modify({ synced: true });
    
    // Mark checkins as synced
    await this.db.checkins.toCollection().modify({ synced: true });
    
    // Mark moods as synced
    await this.db.moods.toCollection().modify({ synced: true });
    
    // Mark missions as synced
    await this.db.missions.toCollection().modify({ synced: true });
    
    // Mark visions as synced
    await this.db.visions.toCollection().modify({ synced: true });
  }
  
  // Clear all data (for logout)
  async clearAll() {
    await this.db.habits.clear();
    await this.db.checkins.clear();
    await this.db.moods.clear();
    await this.db.missions.clear();
    await this.db.visions.clear();
    await this.db.badges.clear();
    await this.db.pendingActions.clear();
    await this.db.syncQueue.clear();
  }
  
  // Export data for backup
  async exportData() {
    const data = {
      habits: await this.db.habits.toArray(),
      checkins: await this.db.checkins.toArray(),
      moods: await this.db.moods.toArray(),
      missions: await this.db.missions.toArray(),
      visions: await this.db.visions.toArray(),
      badges: await this.db.badges.toArray(),
      exportDate: new Date().toISOString()
    };
    
    return data;
  }
  
  // Import data from backup
  async importData(data) {
    await this.clearAll();
    
    if (data.habits) await this.db.habits.bulkPut(data.habits);
    if (data.checkins) await this.db.checkins.bulkPut(data.checkins);
    if (data.moods) await this.db.moods.bulkPut(data.moods);
    if (data.missions) await this.db.missions.bulkPut(data.missions);
    if (data.visions) await this.db.visions.bulkPut(data.visions);
    if (data.badges) await this.db.badges.bulkPut(data.badges);
    
    console.log('✅ Data imported successfully');
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;