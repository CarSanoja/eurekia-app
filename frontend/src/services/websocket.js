class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 5000;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.listeners = new Map();
    this.isConnected = false;
    this.pendingMessages = [];
  }
  
  connect(endpoint, token) {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/${endpoint}/?token=${token}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log(`✅ WebSocket connected to ${endpoint}`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send any pending messages
        this.flushPendingMessages();
        
        // Send initial ping
        this.ping();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.pendingMessages = [];
  }
  
  send(message) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message to send when reconnected
      this.pendingMessages.push(message);
    }
  }
  
  ping() {
    this.send({ type: 'ping' });
    
    // Schedule next ping in 30 seconds
    setTimeout(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, 30000);
  }
  
  flushPendingMessages() {
    while (this.pendingMessages.length > 0 && this.isConnected) {
      const message = this.pendingMessages.shift();
      this.send(message);
    }
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
    
    setTimeout(() => {
      const token = localStorage.getItem('access_token');
      if (token && this.lastEndpoint) {
        this.connect(this.lastEndpoint, token);
      }
    }, this.reconnectInterval);
  }
  
  handleMessage(data) {
    const { type } = data;
    
    // Call all registered listeners for this message type
    const typeListeners = this.listeners.get(type) || [];
    typeListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in WebSocket listener for ${type}:`, error);
      }
    });
    
    // Call wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in WebSocket wildcard listener:', error);
      }
    });
  }
  
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  off(type, callback) {
    const listeners = this.listeners.get(type) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}

// Create WebSocket service instances
export const dashboardWS = new WebSocketService();
export const notificationWS = new WebSocketService();

// Dashboard WebSocket helpers
export const connectDashboard = (token) => {
  dashboardWS.connect('dashboard', token);
};

export const disconnectDashboard = () => {
  dashboardWS.disconnect();
};

export const onDashboardUpdate = (callback) => {
  return dashboardWS.on('dashboard_update', callback);
};

export const requestDashboardRefresh = () => {
  dashboardWS.send({ type: 'refresh' });
};

export const requestSpecificStats = (statType) => {
  dashboardWS.send({ type: 'get_stats', stat_type: statType });
};

// Notification WebSocket helpers
export const connectNotifications = (token) => {
  notificationWS.connect('notifications', token);
};

export const disconnectNotifications = () => {
  notificationWS.disconnect();
};

export const onNotification = (callback) => {
  return notificationWS.on('notification', callback);
};

export const onBadgeUnlock = (callback) => {
  return notificationWS.on('badge_unlock', callback);
};

export const onStreakUpdate = (callback) => {
  return notificationWS.on('streak_update', callback);
};

export const onAchievement = (callback) => {
  return notificationWS.on('achievement', callback);
};

export default {
  dashboardWS,
  notificationWS,
  connectDashboard,
  disconnectDashboard,
  onDashboardUpdate,
  requestDashboardRefresh,
  requestSpecificStats,
  connectNotifications,
  disconnectNotifications,
  onNotification,
  onBadgeUnlock,
  onStreakUpdate,
  onAchievement
};