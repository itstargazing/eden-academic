// Production-ready connection service
// This simulates a real backend service for handling researcher connections

export interface ConnectionRequest {
  id: string;
  fromResearcherId: string;
  toResearcherId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationData {
  id: string;
  type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
  message: string;
  createdAt: Date;
  read: boolean;
}

// In-memory storage (in production, this would be a database)
class ConnectionStorage {
  private connections: Map<string, ConnectionRequest> = new Map();
  private notifications: Map<string, NotificationData[]> = new Map();
  
  // Simulate network delay
  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async sendConnectionRequest(request: Omit<ConnectionRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectionRequest> {
    await this.simulateNetworkDelay();
    
    const connectionRequest: ConnectionRequest = {
      ...request,
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.connections.set(connectionRequest.id, connectionRequest);
    
    // Create notification for recipient
    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'connection_request',
      message: `New connection request from researcher`,
      createdAt: new Date(),
      read: false
    };
    
    const userNotifications = this.notifications.get(request.toResearcherId) || [];
    userNotifications.push(notification);
    this.notifications.set(request.toResearcherId, userNotifications);
    
    return connectionRequest;
  }
  
  async respondToConnection(requestId: string, response: 'accepted' | 'rejected'): Promise<ConnectionRequest | null> {
    await this.simulateNetworkDelay();
    
    const connection = this.connections.get(requestId);
    if (!connection) return null;
    
    connection.status = response;
    connection.updatedAt = new Date();
    this.connections.set(requestId, connection);
    
    // Create notification for sender
    const notification: NotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: response === 'accepted' ? 'connection_accepted' : 'connection_rejected',
      message: `Your connection request was ${response}`,
      createdAt: new Date(),
      read: false
    };
    
    const senderNotifications = this.notifications.get(connection.fromResearcherId) || [];
    senderNotifications.push(notification);
    this.notifications.set(connection.fromResearcherId, senderNotifications);
    
    return connection;
  }
  
  async getConnectionRequests(researcherId: string): Promise<ConnectionRequest[]> {
    await this.simulateNetworkDelay(200);
    
    return Array.from(this.connections.values()).filter(
      conn => conn.toResearcherId === researcherId && conn.status === 'pending'
    );
  }
  
  async getSentConnections(researcherId: string): Promise<ConnectionRequest[]> {
    await this.simulateNetworkDelay(200);
    
    return Array.from(this.connections.values()).filter(
      conn => conn.fromResearcherId === researcherId
    );
  }
  
  async getNotifications(researcherId: string): Promise<NotificationData[]> {
    await this.simulateNetworkDelay(200);
    
    return this.notifications.get(researcherId) || [];
  }
  
  async markNotificationAsRead(researcherId: string, notificationId: string): Promise<void> {
    await this.simulateNetworkDelay(100);
    
    const notifications = this.notifications.get(researcherId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }
  
  async getConnectionStatus(fromResearcherId: string, toResearcherId: string): Promise<ConnectionRequest | null> {
    await this.simulateNetworkDelay(200);
    
    return Array.from(this.connections.values()).find(
      conn => conn.fromResearcherId === fromResearcherId && conn.toResearcherId === toResearcherId
    ) || null;
  }
}

// Global instance (in production, this would be injected)
const connectionStorage = new ConnectionStorage();

// Public API
export const ConnectionService = {
  async sendConnectionRequest(
    fromResearcherId: string,
    toResearcherId: string,
    message: string
  ): Promise<{ success: boolean; data?: ConnectionRequest; error?: string }> {
    try {
      // Check if connection already exists
      const existing = await connectionStorage.getConnectionStatus(fromResearcherId, toResearcherId);
      if (existing) {
        return { success: false, error: 'Connection request already exists' };
      }
      
      const request = await connectionStorage.sendConnectionRequest({
        fromResearcherId,
        toResearcherId,
        message,
        status: 'pending'
      });
      
      return { success: true, data: request };
    } catch (error) {
      return { success: false, error: 'Failed to send connection request' };
    }
  },
  
  async respondToConnection(
    requestId: string,
    response: 'accepted' | 'rejected'
  ): Promise<{ success: boolean; data?: ConnectionRequest; error?: string }> {
    try {
      const connection = await connectionStorage.respondToConnection(requestId, response);
      if (!connection) {
        return { success: false, error: 'Connection request not found' };
      }
      
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, error: 'Failed to respond to connection' };
    }
  },
  
  async getConnectionRequests(researcherId: string): Promise<ConnectionRequest[]> {
    try {
      return await connectionStorage.getConnectionRequests(researcherId);
    } catch (error) {
      return [];
    }
  },
  
  async getSentConnections(researcherId: string): Promise<ConnectionRequest[]> {
    try {
      return await connectionStorage.getSentConnections(researcherId);
    } catch (error) {
      return [];
    }
  },
  
  async getNotifications(researcherId: string): Promise<NotificationData[]> {
    try {
      return await connectionStorage.getNotifications(researcherId);
    } catch (error) {
      return [];
    }
  },
  
  async markNotificationAsRead(researcherId: string, notificationId: string): Promise<void> {
    try {
      await connectionStorage.markNotificationAsRead(researcherId, notificationId);
    } catch (error) {
      // Silently fail
    }
  },
  
  async getConnectionStatus(fromResearcherId: string, toResearcherId: string): Promise<ConnectionRequest | null> {
    try {
      return await connectionStorage.getConnectionStatus(fromResearcherId, toResearcherId);
    } catch (error) {
      return null;
    }
  }
}; 