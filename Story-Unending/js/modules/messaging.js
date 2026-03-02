/**
 * Messaging Module
 * Manages user-to-user messaging system
 * 
 * @namespace Messaging
 */
(function() {
    'use strict';

    // Private variables
    let conversations = {};
    let messages = {};

    /**
     * Initialize messaging module
     */
    const init = () => {
        loadConversations();
        loadMessages();
    }

    /**
     * Load conversations from localStorage
     */
    const loadConversations = () => {
        try {
            const stored = Storage.getItem('story_conversations');
            if (stored) {
                conversations = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load conversations', error);
        }
    }

    /**
     * Save conversations to localStorage
     */
    const saveConversations = () => {
        try {
            Storage.setItem('story_conversations', JSON.stringify(conversations));
        } catch (error) {
            ErrorHandler.handleError('Failed to save conversations', error);
        }
    }

    /**
     * Load messages from localStorage
     */
    const loadMessages = () => {
        try {
            const stored = Storage.getItem('story_messages');
            if (stored) {
                messages = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load messages', error);
        }
    }

    /**
     * Save messages to localStorage
     */
    const saveMessages = () => {
        try {
            Storage.setItem('story_messages', JSON.stringify(messages));
        } catch (error) {
            ErrorHandler.handleError('Failed to save messages', error);
        }
    }

    /**
     * Get conversation ID between two users
     * @param {string} user1 - First username
     * @param {string} user2 - Second username
     * @returns {string} Conversation ID
     */
    const getConversationId = (user1, user2) => {
        const sorted = [user1, user2].sort();
        return sorted.join('_');
    }

    /**
     * Create or get conversation
     * @param {string} user1 - First username
     * @param {string} user2 - Second username
     * @returns {string} Conversation ID
     */
    const createConversation = (user1, user2) => {
        const conversationId = getConversationId(user1, user2);

        if (!conversations[conversationId]) {
            conversations[conversationId] = {
                id: conversationId,
                participants: [user1, user2],
                createdAt: new Date().toISOString(),
                lastMessageAt: null,
                unread: {
                    [user1]: 0,
                    [user2]: 0
                }
            };
            saveConversations();
        }

        return conversationId;
    }

    /**
     * Send message
     * @param {string} from - Sender username
     * @param {string} to - Recipient username
     * @param {string} content - Message content
     * @returns {object} Sent message
     */
    const sendMessage = (from, to, content) => {
        const conversationId = createConversation(from, to);
        const messageId = generateMessageId();

        if (!messages[conversationId]) {
            messages[conversationId] = [];
        }

        const message = {
            id: messageId,
            conversationId: conversationId,
            from: from,
            to: to,
            content: content,
            sentAt: new Date().toISOString(),
            read: false
        };

        messages[conversationId].push(message);

        // Update conversation
        conversations[conversationId].lastMessageAt = message.sentAt;
        conversations[conversationId].unread[to]++;

        saveMessages();
        saveConversations();

        return message;
    }

    /**
     * Generate unique message ID
     * @returns {string} Message ID
     */
    const generateMessageId = () => {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get messages for conversation
     * @param {string} conversationId - Conversation ID
     * @returns {array} Array of messages
     */
    const getMessages = (conversationId) => {
        return messages[conversationId] || [];
    }

    /**
     * Get conversation between two users
     * @param {string} user1 - First username
     * @param {string} user2 - Second username
     * @returns {array} Array of messages
     */
    const getConversation = (user1, user2) => {
        const conversationId = getConversationId(user1, user2);
        return getMessages(conversationId);
    }

    /**
     * Mark message as read
     * @param {string} messageId - Message ID
     * @param {string} conversationId - Conversation ID
     */
    const markAsRead = (messageId, conversationId) => {
        if (!messages[conversationId]) {
            throw new Error('Conversation not found');
        }

        const message = messages[conversationId].find(m => m.id === messageId);
        if (!message) {
            throw new Error('Message not found');
        }

        message.read = true;
        saveMessages();

        // Update unread count
        if (conversations[conversationId]) {
            conversations[conversationId].unread[message.to]--;
            saveConversations();
        }
    }

    /**
     * Mark all messages in conversation as read
     * @param {string} conversationId - Conversation ID
     * @param {string} username - Username
     */
    const markConversationAsRead = (conversationId, username) => {
        if (!messages[conversationId]) {
            return;
        }

        messages[conversationId].forEach(message => {
            if (message.to === username) {
                message.read = true;
            }
        });

        saveMessages();

        // Update unread count
        if (conversations[conversationId]) {
            conversations[conversationId].unread[username] = 0;
            saveConversations();
        }
    }

    /**
     * Delete message
     * @param {string} messageId - Message ID
     * @param {string} conversationId - Conversation ID
     */
    const deleteMessage = (messageId, conversationId) => {
        if (!messages[conversationId]) {
            throw new Error('Conversation not found');
        }

        const index = messages[conversationId].findIndex(m => m.id === messageId);
        if (index === -1) {
            throw new Error('Message not found');
        }

        messages[conversationId].splice(index, 1);
        saveMessages();
    }

    /**
     * Get user conversations
     * @param {string} username - Username
     * @returns {array} Array of conversations
     */
    const getUserConversations = (username) => {
        return Object.values(conversations).filter(conv => 
            conv.participants.includes(username)
        ).sort((a, b) => {
            const dateA = new Date(a.lastMessageAt || a.createdAt);
            const dateB = new Date(b.lastMessageAt || b.createdAt);
            return dateB - dateA;
        });
    }

    /**
     * Get unread message count
     * @param {string} username - Username
     * @returns {number} Unread message count
     */
    const getUnreadCount = (username) => {
        let count = 0;
        Object.values(conversations).forEach(conv => {
            if (conv.participants.includes(username)) {
                count += conv.unread[username] || 0;
            }
        });
        return count;
    }

    /**
     * Get messaging statistics
     * @param {string} username - Username
     * @returns {object} Messaging statistics
     */
    const getMessagingStats = (username) => {
        const userConversations = getUserConversations(username);
        let totalMessages = 0;
        let sentMessages = 0;
        let receivedMessages = 0;

        userConversations.forEach(conv => {
            const convMessages = messages[conv.id] || [];
            totalMessages += convMessages.length;
            sentMessages += convMessages.filter(m => m.from === username).length;
            receivedMessages += convMessages.filter(m => m.to === username).length;
        });

        return {
            conversations: userConversations.length,
            totalMessages: totalMessages,
            sentMessages: sentMessages,
            receivedMessages: receivedMessages,
            unreadMessages: getUnreadCount(username)
        };
    }

    /**
     * Search messages
     * @param {string} username - Username
     * @param {string} query - Search query
     * @returns {array} Array of matching messages
     */
    const searchMessages = (username, query) => {
        const results = [];
        const lowerQuery = query.toLowerCase();

        Object.entries(messages).forEach(([conversationId, convMessages]) => {
            const conversation = conversations[conversationId];
            if (!conversation || !conversation.participants.includes(username)) {
                return;
            }

            convMessages.forEach(message => {
                if (message.content.toLowerCase().includes(lowerQuery)) {
                    results.push(message);
                }
            });
        });

        return results;
    }

    /**
     * Export messaging data
     * @param {string} format - Export format ('json')
     * @returns {string} Exported data
     */
    const exportMessagingData = (format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON export is supported');
        }

        const data = {
            conversations: conversations,
            messages: messages,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import messaging data
     * @param {string} data - Messaging data to import
     * @param {string} format - Import format ('json')
     */
    const importMessagingData = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge conversations
            Object.assign(conversations, imported.conversations || {});

            // Merge messages
            Object.entries(imported.messages || {}).forEach(([conversationId, convMessages]) => {
                if (!messages[conversationId]) {
                    messages[conversationId] = [];
                }
                messages[conversationId].push(...convMessages);
            });

            saveConversations();
            saveMessages();

        } catch (error) {
            ErrorHandler.handleError('Failed to import messaging data', error);
            throw error;
        }
    }

    /**
     * Clear all messaging data
     */
    const clearAllMessagingData = () => {
        conversations = {};
        messages = {};

        saveConversations();
        saveMessages();
    }

    // Export public API
    window.Messaging = {
        init: init,
        createConversation: createConversation,
        sendMessage: sendMessage,
        getMessages: getMessages,
        getConversation: getConversation,
        markAsRead: markAsRead,
        markConversationAsRead: markConversationAsRead,
        deleteMessage: deleteMessage,
        getUserConversations: getUserConversations,
        getUnreadCount: getUnreadCount,
        getMessagingStats: getMessagingStats,
        searchMessages: searchMessages,
        exportMessagingData: exportMessagingData,
        importMessagingData: importMessagingData,
        clearAllMessagingData: clearAllMessagingData
    };

})();