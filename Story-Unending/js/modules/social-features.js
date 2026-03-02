/**
 * Social Features Module
 * Manages social features like sharing, comments, and following
 * 
 * @namespace SocialFeatures
 */
(function() {
    'use strict';

    // Private variables
    let comments = {};
    let shares = {};
    let follows = {};

    /**
     * Initialize social features module
     */
    const init = () => {
        loadComments();
        loadShares();
        loadFollows();
    }

    /**
     * Load comments from localStorage
     */
    const loadComments = () => {
        try {
            const stored = Storage.getItem('story_comments');
            if (stored) {
                comments = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load comments', error);
        }
    }

    /**
     * Save comments to localStorage
     */
    const saveComments = () => {
        try {
            Storage.setItem('story_comments', JSON.stringify(comments));
        } catch (error) {
            ErrorHandler.handleError('Failed to save comments', error);
        }
    }

    /**
     * Load shares from localStorage
     */
    const loadShares = () => {
        try {
            const stored = Storage.getItem('story_shares');
            if (stored) {
                shares = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load shares', error);
        }
    }

    /**
     * Save shares to localStorage
     */
    const saveShares = () => {
        try {
            Storage.setItem('story_shares', JSON.stringify(shares));
        } catch (error) {
            ErrorHandler.handleError('Failed to save shares', error);
        }
    }

    /**
     * Load follows from localStorage
     */
    const loadFollows = () => {
        try {
            const stored = Storage.getItem('story_follows');
            if (stored) {
                follows = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load follows', error);
        }
    }

    /**
     * Save follows to localStorage
     */
    const saveFollows = () => {
        try {
            Storage.setItem('story_follows', JSON.stringify(follows));
        } catch (error) {
            ErrorHandler.handleError('Failed to save follows', error);
        }
    }

    /**
     * Add comment to chapter
     * @param {string} username - Username
     * @param {number} chapterNumber - Chapter number
     * @param {string} content - Comment content
     * @returns {object} Created comment
     */
    const addComment = (username, chapterNumber, content) => {
        const commentId = generateCommentId();
        
        if (!comments[chapterNumber]) {
            comments[chapterNumber] = [];
        }

        const comment = {
            id: commentId,
            username: username,
            chapterNumber: chapterNumber,
            content: content,
            createdAt: new Date().toISOString(),
            likes: 0,
            replies: []
        };

        comments[chapterNumber].push(comment);
        saveComments();

        return comment;
    }

    /**
     * Generate unique comment ID
     * @returns {string} Comment ID
     */
    const generateCommentId = () => {
        return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get comments for chapter
     * @param {number} chapterNumber - Chapter number
     * @returns {array} Array of comments
     */
    const getComments = (chapterNumber) => {
        return comments[chapterNumber] || [];
    }

    /**
     * Delete comment
     * @param {string} commentId - Comment ID
     * @param {number} chapterNumber - Chapter number
     */
    const deleteComment = (commentId, chapterNumber) => {
        if (!comments[chapterNumber]) {
            throw new Error('Chapter comments not found');
        }

        const index = comments[chapterNumber].findIndex(c => c.id === commentId);
        if (index === -1) {
            throw new Error('Comment not found');
        }

        comments[chapterNumber].splice(index, 1);
        saveComments();
    }

    /**
     * Like comment
     * @param {string} commentId - Comment ID
     * @param {number} chapterNumber - Chapter number
     */
    const likeComment = (commentId, chapterNumber) => {
        if (!comments[chapterNumber]) {
            throw new Error('Chapter comments not found');
        }

        const comment = comments[chapterNumber].find(c => c.id === commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        comment.likes++;
        saveComments();
    }

    /**
     * Share chapter
     * @param {string} username - Username
     * @param {number} chapterNumber - Chapter number
     * @param {string} platform - Platform (twitter, facebook, etc.)
     * @returns {object} Share record
     */
    const shareChapter = (username, chapterNumber, platform) => {
        const shareId = generateShareId();
        
        if (!shares[chapterNumber]) {
            shares[chapterNumber] = [];
        }

        const share = {
            id: shareId,
            username: username,
            chapterNumber: chapterNumber,
            platform: platform,
            sharedAt: new Date().toISOString()
        };

        shares[chapterNumber].push(share);
        saveShares();

        return share;
    }

    /**
     * Generate unique share ID
     * @returns {string} Share ID
     */
    const generateShareId = () => {
        return 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get shares for chapter
     * @param {number} chapterNumber - Chapter number
     * @returns {array} Array of shares
     */
    const getShares = (chapterNumber) => {
        return shares[chapterNumber] || [];
    }

    /**
     * Get share statistics
     * @param {number} chapterNumber - Chapter number
     * @returns {object} Share statistics
     */
    const getShareStats = (chapterNumber) => {
        const chapterShares = shares[chapterNumber] || [];
        const byPlatform = {};

        chapterShares.forEach(share => {
            if (!byPlatform[share.platform]) {
                byPlatform[share.platform] = 0;
            }
            byPlatform[share.platform]++;
        });

        return {
            total: chapterShares.length,
            byPlatform: byPlatform
        };
    }

    /**
     * Follow user
     * @param {string} follower - Follower username
     * @param {string} following - Following username
     */
    const followUser = (follower, following) => {
        if (follower === following) {
            throw new Error('Cannot follow yourself');
        }

        if (!follows[follower]) {
            follows[follower] = [];
        }

        if (follows[follower].includes(following)) {
            throw new Error('Already following this user');
        }

        follows[follower].push(following);
        saveFollows();

        // Update user profiles
        try {
            const followerProfile = UserProfiles.getProfile(follower);
            const followingProfile = UserProfiles.getProfile(following);

            if (followerProfile) {
                followerProfile.social.following.push(following);
            }
            if (followingProfile) {
                followingProfile.social.followers.push(follower);
            }
        } catch (error) {
            // Profiles might not exist
        }
    }

    /**
     * Unfollow user
     * @param {string} follower - Follower username
     * @param {string} following - Following username
     */
    const unfollowUser = (follower, following) => {
        if (!follows[follower]) {
            throw new Error('Not following anyone');
        }

        const index = follows[follower].indexOf(following);
        if (index === -1) {
            throw new Error('Not following this user');
        }

        follows[follower].splice(index, 1);
        saveFollows();

        // Update user profiles
        try {
            const followerProfile = UserProfiles.getProfile(follower);
            const followingProfile = UserProfiles.getProfile(following);

            if (followerProfile) {
                const idx = followerProfile.social.following.indexOf(following);
                if (idx !== -1) {
                    followerProfile.social.following.splice(idx, 1);
                }
            }
            if (followingProfile) {
                const idx = followingProfile.social.followers.indexOf(follower);
                if (idx !== -1) {
                    followingProfile.social.followers.splice(idx, 1);
                }
            }
        } catch (error) {
            // Profiles might not exist
        }
    }

    /**
     * Get followers
     * @param {string} username - Username
     * @returns {array} Array of followers
     */
    const getFollowers = (username) => {
        const followers = [];
        Object.entries(follows).forEach(([follower, followingList]) => {
            if (followingList.includes(username)) {
                followers.push(follower);
            }
        });
        return followers;
    }

    /**
     * Get following
     * @param {string} username - Username
     * @returns {array} Array of following
     */
    const getFollowing = (username) => {
        return follows[username] || [];
    }

    /**
     * Check if following
     * @param {string} follower - Follower username
     * @param {string} following - Following username
     * @returns {boolean} True if following
     */
    const isFollowing = (follower, following) => {
        if (!follows[follower]) {
            return false;
        }
        return follows[follower].includes(following);
    }

    /**
     * Get social statistics
     * @param {string} username - Username
     * @returns {object} Social statistics
     */
    const getSocialStats = (username) => {
        return {
            followers: getFollowers(username).length,
            following: getFollowing(username).length,
            comments: Object.values(comments).flat().filter(c => c.username === username).length,
            shares: Object.values(shares).flat().filter(s => s.username === username).length
        };
    }

    /**
     * Export social data
     * @param {string} format - Export format ('json')
     * @returns {string} Exported data
     */
    const exportSocialData = (format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON export is supported');
        }

        const data = {
            comments: comments,
            shares: shares,
            follows: follows,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Import social data
     * @param {string} data - Social data to import
     * @param {string} format - Import format ('json')
     */
    const importSocialData = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge comments
            Object.entries(imported.comments || {}).forEach(([chapterNumber, chapterComments]) => {
                if (!comments[chapterNumber]) {
                    comments[chapterNumber] = [];
                }
                comments[chapterNumber].push(...chapterComments);
            });

            // Merge shares
            Object.entries(imported.shares || {}).forEach(([chapterNumber, chapterShares]) => {
                if (!shares[chapterNumber]) {
                    shares[chapterNumber] = [];
                }
                shares[chapterNumber].push(...chapterShares);
            });

            // Merge follows
            Object.assign(follows, imported.follows || {});

            saveComments();
            saveShares();
            saveFollows();

        } catch (error) {
            ErrorHandler.handleError('Failed to import social data', error);
            throw error;
        }
    }

    /**
     * Clear all social data
     */
    const clearAllSocialData = () => {
        comments = {};
        shares = {};
        follows = {};

        saveComments();
        saveShares();
        saveFollows();
    }

    // Export public API
    window.SocialFeatures = {
        init: init,
        addComment: addComment,
        getComments: getComments,
        deleteComment: deleteComment,
        likeComment: likeComment,
        shareChapter: shareChapter,
        getShares: getShares,
        getShareStats: getShareStats,
        followUser: followUser,
        unfollowUser: unfollowUser,
        getFollowers: getFollowers,
        getFollowing: getFollowing,
        isFollowing: isFollowing,
        getSocialStats: getSocialStats,
        exportSocialData: exportSocialData,
        importSocialData: importSocialData,
        clearAllSocialData: clearAllSocialData
    };

})();