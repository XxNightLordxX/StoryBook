/**
 * Content Management System Module
 * Provides admin tools for managing and editing story content
 * 
 * @namespace ContentManagement
 */
(function() {
    'use strict';

    // Private variables
    let contentVersions = {};
    let currentVersion = {};
    let draftContent = {};
    let approvalQueue = [];
    const MAX_APPROVAL_QUEUE_SIZE = 1000;

    /**
     * Initialize content management system
     */
    const init = () => {
        loadContentVersions();
        loadDraftContent();
        loadApprovalQueue();
    }

    /**
     * Load content versions from localStorage
     */
    const loadContentVersions = () => {
        try {
            const stored = Storage.getItem('story_content_versions');
            if (stored) {
                contentVersions = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load content versions', error);
        }
    }

    /**
     * Save content versions to localStorage
     */
    const saveContentVersions = () => {
        try {
            Storage.setItem('story_content_versions', JSON.stringify(contentVersions));
        } catch (error) {
            ErrorHandler.handleError('Failed to save content versions', error);
        }
    }

    /**
     * Load draft content from localStorage
     */
    const loadDraftContent = () => {
        try {
            const stored = Storage.getItem('story_draft_content');
            if (stored) {
                draftContent = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load draft content', error);
        }
    }

    /**
     * Save draft content to localStorage
     */
    const saveDraftContent = () => {
        try {
            Storage.setItem('story_draft_content', JSON.stringify(draftContent));
        } catch (error) {
            ErrorHandler.handleError('Failed to save draft content', error);
        }
    }

    /**
     * Load approval queue from localStorage
     */
    const loadApprovalQueue = () => {
        try {
            const stored = Storage.getItem('story_approval_queue');
            if (stored) {
                approvalQueue = JSON.parse(stored);
            }
        } catch (error) {
            ErrorHandler.handleError('Failed to load approval queue', error);
        }
    }

    /**
     * Save approval queue to localStorage
     */
    const saveApprovalQueue = () => {
        try {
            Storage.setItem('story_approval_queue', JSON.stringify(approvalQueue));
        } catch (error) {
            ErrorHandler.handleError('Failed to save approval queue', error);
        }
    }

    /**
     * Get current chapter content
     * @param {number} chapterNumber - Chapter number
     * @returns {object} Chapter content
     */
    const getChapterContent = (chapterNumber) => {
        // This would typically fetch from the story engine
        // For now, return a placeholder
        return {
            chapterNumber: chapterNumber,
            title: `Chapter ${chapterNumber}`,
            content: '',
            metadata: {
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                author: 'System',
                status: 'published'
            }
        };
    }

    /**
     * Create a new version of chapter content
     * @param {number} chapterNumber - Chapter number
     * @param {object} content - Chapter content
     * @param {string} changeDescription - Description of changes
     * @returns {string} Version ID
     */
    const createVersion = (chapterNumber, content, changeDescription) => {
        const versionId = generateVersionId(chapterNumber);
        
        if (!contentVersions[chapterNumber]) {
            contentVersions[chapterNumber] = [];
        }

        const version = {
            id: versionId,
            chapterNumber: chapterNumber,
            content: content,
            changeDescription: changeDescription,
            createdAt: new Date().toISOString(),
            createdBy: getCurrentUser(),
            status: 'draft'
        };

        contentVersions[chapterNumber].push(version);
        saveContentVersions();

        return versionId;
    }

    /**
     * Generate unique version ID
     * @param {number} chapterNumber - Chapter number
     * @returns {string} Version ID
     */
    const generateVersionId = (chapterNumber) => {
        return `v${chapterNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current user
     * @returns {string} Current username
     */
    const getCurrentUser = () => {
        // This would typically get from auth system
        return 'admin';
    }

    /**
     * Get all versions for a chapter
     * @param {number} chapterNumber - Chapter number
     * @returns {array} Array of versions
     */
    const getVersions = (chapterNumber) => {
        return contentVersions[chapterNumber] || [];
    }

    /**
     * Get a specific version
     * @param {number} chapterNumber - Chapter number
     * @param {string} versionId - Version ID
     * @returns {object|null} Version object or null
     */
    const getVersion = (chapterNumber, versionId) => {
        const versions = getVersions(chapterNumber);
        return versions.find(v => v.id === versionId) || null;
    }

    /**
     * Save draft content
     * @param {number} chapterNumber - Chapter number
     * @param {object} content - Draft content
     */
    const saveDraft = (chapterNumber, content) => {
        draftContent[chapterNumber] = {
            content: content,
            savedAt: new Date().toISOString(),
            savedBy: getCurrentUser()
        };
        saveDraftContent();
    }

    /**
     * Get draft content
     * @param {number} chapterNumber - Chapter number
     * @returns {object|null} Draft content or null
     */
    const getDraft = (chapterNumber) => {
        return draftContent[chapterNumber] || null;
    }

    /**
     * Delete draft content
     * @param {number} chapterNumber - Chapter number
     */
    const deleteDraft = (chapterNumber) => {
        delete draftContent[chapterNumber];
        saveDraftContent();
    }

    /**
     * Submit content for approval
     * @param {number} chapterNumber - Chapter number
     * @param {string} versionId - Version ID
     * @param {string} notes - Approval notes
     */
    const submitForApproval = (chapterNumber, versionId, notes) => {
        const version = getVersion(chapterNumber, versionId);
        if (!version) {
            throw new Error('Version not found');
        }

        const approvalRequest = {
            id: generateApprovalId(),
            chapterNumber: chapterNumber,
            versionId: versionId,
            version: version,
            notes: notes,
            submittedAt: new Date().toISOString(),
            submittedBy: getCurrentUser(),
            status: 'pending'
        };

        approvalQueue.push(approvalRequest);
        // Enforce queue size limit - remove oldest completed items first
        if (approvalQueue.length > MAX_APPROVAL_QUEUE_SIZE) {
            approvalQueue = approvalQueue.filter(r => r.status === 'pending')
                .concat(approvalQueue.filter(r => r.status !== 'pending').slice(-MAX_APPROVAL_QUEUE_SIZE / 2));
        }
        saveApprovalQueue();

        return approvalRequest.id;
    }

    /**
     * Generate unique approval ID
     * @returns {string} Approval ID
     */
    const generateApprovalId = () => {
        return `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get approval queue
 * @returns {array} Array of approval requests
 */
const getApprovalQueue = () => {
    return approvalQueue;
}

/**
 * Approve content
 * @param {string} approvalId - Approval ID
 * @param {string} notes - Approval notes
 */
const approveContent = (approvalId, notes) => {
    const request = approvalQueue.find(r => r.id === approvalId);
    if (!request) {
        throw new Error('Approval request not found');
    }

    request.status = 'approved';
    request.approvedAt = new Date().toISOString();
    request.approvedBy = getCurrentUser();
    request.approvalNotes = notes;

    // Update version status
    const version = getVersion(request.chapterNumber, request.versionId);
    if (version) {
        version.status = 'published';
        version.publishedAt = new Date().toISOString();
        version.publishedBy = getCurrentUser();
    }

    saveApprovalQueue();
    saveContentVersions();
}

/**
 * Reject content
 * @param {string} approvalId - Approval ID
 * @param {string} notes - Rejection notes
 */
const rejectContent = (approvalId, notes) => {
    const request = approvalQueue.find(r => r.id === approvalId);
    if (!request) {
        throw new Error('Approval request not found');
    }

    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();
    request.rejectedBy = getCurrentUser();
    request.rejectionNotes = notes;

    // Update version status
    const version = getVersion(request.chapterNumber, request.versionId);
    if (version) {
        version.status = 'rejected';
    }

    saveApprovalQueue();
    saveContentVersions();
}

/**
 * Get content statistics
 * @returns {object} Content statistics
 */
const getStatistics = () => {
    const totalVersions = Object.values(contentVersions).reduce((sum, versions) => sum + versions.length, 0);
    const publishedVersions = Object.values(contentVersions).reduce((sum, versions) =>
        sum + versions.filter(v => v.status === 'published').length, 0);
    const draftVersions = Object.values(contentVersions).reduce((sum, versions) =>
        sum + versions.filter(v => v.status === 'draft').length, 0);
    const pendingApprovals = approvalQueue.filter(r => r.status === 'pending').length;

    return {
        totalVersions: totalVersions,
        publishedVersions: publishedVersions,
        draftVersions: draftVersions,
        pendingApprovals: pendingApprovals,
        totalDrafts: Object.keys(draftContent).length,
        chaptersWithVersions: Object.keys(contentVersions).length
    };
}

/**
 * Search content
 * @param {string} query - Search query
 * @returns {array} Search results
 */
const searchContent = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    // Search in versions
    Object.entries(contentVersions).forEach(([chapterNumber, versions]) => {
        versions.forEach(version => {
            const content = JSON.stringify(version.content).toLowerCase();
            const description = version.changeDescription.toLowerCase();

            if (content.includes(lowerQuery) || description.includes(lowerQuery)) {
                results.push({
                    type: 'version',
                    chapterNumber: parseInt(chapterNumber),
                    versionId: version.id,
                    title: version.content.title || `Chapter ${chapterNumber}`,
                    description: version.changeDescription,
                    status: version.status,
                    createdAt: version.createdAt
                    });
                }
            });
        });

        // Search in drafts
        Object.entries(draftContent).forEach(([chapterNumber, draft]) => {
            const content = JSON.stringify(draft.content).toLowerCase();
            if (content.includes(lowerQuery)) {
                results.push({
                    type: 'draft',
                    chapterNumber: parseInt(chapterNumber),
                    title: draft.content.title || `Chapter ${chapterNumber}`,
                    savedAt: draft.savedAt,
                    savedBy: draft.savedBy
                });
            }
        });

        return results;
    }

    /**
     * Export content
     * @param {string} format - Export format ('json' or 'markdown')
     * @returns {string} Exported content
     */
    const exportContent = (format = 'json') => {
        const data = {
            versions: contentVersions,
            drafts: draftContent,
            approvalQueue: approvalQueue,
            exportedAt: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'markdown') {
            return convertToMarkdown(data);
        }

        throw new Error('Unsupported export format: ' + format);
    }

    /**
     * Convert content to markdown format
     * @param {object} data - Content data
     * @returns {string} Markdown formatted content
     */
    const convertToMarkdown = (data) => {
        let markdown = '# Content Export\n\n';
        markdown += `Exported at: ${data.exportedAt}\n\n`;

        // Add versions
        markdown += '## Versions\n\n';
        Object.entries(data.versions).forEach(([chapterNumber, versions]) => {
            markdown += `### Chapter ${chapterNumber}\n\n`;
            versions.forEach(version => {
                markdown += `#### Version: ${version.id}\n`;
                markdown += `- Status: ${version.status}\n`;
                markdown += `- Created: ${version.createdAt}\n`;
                markdown += `- Description: ${version.changeDescription}\n\n`;
            });
        });

        // Add drafts
        markdown += '## Drafts\n\n';
        Object.entries(data.drafts).forEach(([chapterNumber, draft]) => {
            markdown += `### Chapter ${chapterNumber}\n`;
            markdown += `- Saved at: ${draft.savedAt}\n`;
            markdown += `- Saved by: ${draft.savedBy}\n\n`;
        });

        return markdown;
    }

    /**
     * Import content
     * @param {string} data - Content data to import
     * @param {string} format - Import format ('json')
     */
    const importContent = (data, format = 'json') => {
        if (format !== 'json') {
            throw new Error('Only JSON import is supported');
        }

        try {
            const imported = JSON.parse(data);

            // Merge versions
            Object.entries(imported.versions || {}).forEach(([chapterNumber, versions]) => {
                if (!contentVersions[chapterNumber]) {
                    contentVersions[chapterNumber] = [];
                }
                contentVersions[chapterNumber].push(...versions);
            });

            // Merge drafts
            Object.assign(draftContent, imported.drafts || {});

            // Merge approval queue with size limit
            approvalQueue.push(...(imported.approvalQueue || []));
            if (approvalQueue.length > MAX_APPROVAL_QUEUE_SIZE) {
                approvalQueue = approvalQueue.slice(-MAX_APPROVAL_QUEUE_SIZE);
            }

            saveContentVersions();
            saveDraftContent();
            saveApprovalQueue();

        } catch (error) {
            ErrorHandler.handleError('Failed to import content', error);
            throw error;
        }
    }

    /**
     * Clear all content management data
     */
    const clearAllData = () => {
        contentVersions = {};
        draftContent = {};
        approvalQueue = [];

        saveContentVersions();
        saveDraftContent();
        saveApprovalQueue();
    }

    // Export public API
    window.ContentManagement = {
        init: init,
        getChapterContent: getChapterContent,
        createVersion: createVersion,
        getVersions: getVersions,
        getVersion: getVersion,
        saveDraft: saveDraft,
        getDraft: getDraft,
        deleteDraft: deleteDraft,
        submitForApproval: submitForApproval,
        getApprovalQueue: getApprovalQueue,
        approveContent: approveContent,
        rejectContent: rejectContent,
        getStatistics: getStatistics,
        searchContent: searchContent,
        exportContent: exportContent,
        importContent: importContent,
        clearAllData: clearAllData
    };

})();