/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Prompt Modal Utility
 * 
 * A simple modal dialog to replace prompt() calls
 * Provides a better UX than the native prompt() function
 */

(function() {
    'use strict';

    /**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
     * Show a prompt modal dialog
     * @param {string} message - The message to display
     * @param {string} defaultValue - Default value for the input
     * @param {string} title - Optional title for the modal
     * @returns {Promise<string|null>} - Promise that resolves with user input or null if cancelled
     */
    const showPromptModal = (message, defaultValue = '', title = 'Input Required') => {
        return new Promise((resolve) => {
            // Create modal elements
            const modal = document.createElement('div');
            modal.className = 'prompt-modal-overlay';
            modal.innerHTML = `
              <div class="prompt-modal">
                  <div class="prompt-modal-header">
                      <h3>${sanitizeHTML(title)}</h3>
                      <button class="prompt-modal-close" onclick="this.closest('.prompt-modal-overlay').remove(); resolve(null);">&times;</button>
                  </div>
                  <div class="prompt-modal-body">
                      <p>${sanitizeHTML(message)}</p>
                      <input type="text" class="prompt-modal-input" value="${sanitizeHTML(defaultValue)}" />
                  </div>
                  <div class="prompt-modal-footer">
                      <button class="prompt-modal-cancel" onclick="this.closest('.prompt-modal-overlay').remove(); resolve(null);">Cancel</button>
                      <button class="prompt-modal-confirm">OK</button>
                  </div>
              </div>
          `;

            // Add styles if not already present
            if (!DOMHelpers.safeGetElement('prompt-modal-styles')) {
                const styles = document.createElement('style');
                styles.id = 'prompt-modal-styles';
                styles.textContent = `
                  .prompt-modal-overlay {
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      background: rgba(0, 0, 0, 0.5);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      z-index: 10000;
                  }
                  .prompt-modal {
                      background: white;
                      border-radius: 8px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                      max-width: 500px;
                      width: 90%;
                      animation: promptModalFadeIn 0.2s ease-out;
                  }
                  @keyframes promptModalFadeIn {
                      from { opacity: 0; transform: scale(0.9); }
                      to { opacity: 1; transform: scale(1); }
                  }
                  .prompt-modal-header {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 16px 20px;
                      border-bottom: 1px solid #e0e0e0;
                  }
                  .prompt-modal-header h3 {
                      margin: 0;
                      font-size: 18px;
                      color: #333;
                  }
                  .prompt-modal-close {
                      background: none;
                      border: none;
                      font-size: 24px;
                      cursor: pointer;
                      color: #999;
                      padding: 0;
                      width: 30px;
                      height: 30px;
                  }
                  .prompt-modal-close:hover {
                      color: #333;
                  }
                  .prompt-modal-body {
                      padding: 20px;
                  }
                  .prompt-modal-body p {
                      margin: 0 0 16px 0;
                      color: #555;
                  }
                  .prompt-modal-input {
                      width: 100%;
                      padding: 10px 12px;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      font-size: 14px;
                      box-sizing: border-box;
                  }
                  .prompt-modal-input:focus {
                      outline: none;
                      border-color: #4CAF50;
                      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
                  }
                  .prompt-modal-footer {
                      display: flex;
                      justify-content: flex-end;
                      gap: 10px;
                      padding: 16px 20px;
                      border-top: 1px solid #e0e0e0;
                  }
                  .prompt-modal-cancel,
                  .prompt-modal-confirm {
                      padding: 8px 20px;
                      border: none;
                      border-radius: 4px;
                      cursor: pointer;
                      font-size: 14px;
                      font-weight: 500;
                  }
                  .prompt-modal-cancel {
                      background: #f5f5f5;
                      color: #666;
                  }
                  .prompt-modal-cancel:hover {
                      background: #e0e0e0;
                  }
                  .prompt-modal-confirm {
                      background: #4CAF50;
                      color: white;
                  }
                  .prompt-modal-confirm:hover {
                      background: #45a049;
                  }
                `;
                document.head.appendChild(styles);
            }

            // Add modal to DOM
            document.body.appendChild(modal);

            // Focus input
            const input = modal.querySelector('.prompt-modal-input');
            input.focus();
            input.select();

            // Handle confirm button
            const confirmBtn = modal.querySelector('.prompt-modal-confirm');
            confirmBtn.addEventListener('click', () => {
                const value = input.value;
                modal.remove();
                resolve(value);
            });

            // Handle Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmBtn.click();
                }
            });

            // Handle Escape key
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    resolve(null);
                }
            });
        });
    }

    // Export to global scope
    window.PromptModal = {
        show: showPromptModal
    };

})();