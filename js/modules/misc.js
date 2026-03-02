/**
 * Updated to use DOM Helpers for null safety (UZF-MSR v1.0 Rule 18)
 */
/**
 * Miscellaneous functions
 * Extracted from index.html
 */

window.miscJsLoaded = true;

(function() {
  
    // Import security functions from global scope
    const sanitizeHTML = window.sanitizeHTML || ((str) => str);
    const sanitizeAttribute = window.sanitizeAttribute || ((str) => str);

  // Safe showNotification wrapper - prevents crashes if notifications UI hasn't loaded yet
  const safeShowNotification = (...args) => {
    if (typeof showNotification === 'function') {
      showNotification(...args);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(...args);
    } else {
    }
  };
  // Constants
  const STORY_START = new Date('2026-02-26T00:00:00Z').getTime();
  let CHAPTER_INTERVAL_MS = parseInt(Storage.getItem('ese_chapterInterval', 30000));
  const MAX_CHAPTERS = 10000;
  
  // Validate chapter interval
  if (isNaN(CHAPTER_INTERVAL_MS) || CHAPTER_INTERVAL_MS < 1000) CHAPTER_INTERVAL_MS = 30000;
  if (CHAPTER_INTERVAL_MS > 3600000) CHAPTER_INTERVAL_MS = 30000;
  
  // Director mode state
  let directorMode = false;
  
  // Generation mode configuration
  let generationMode = Storage.getItem('ese_generationMode', 'unlimited');
  
  // Story rules configuration
  let storyRules = Storage.getItem('ese_storyRules', []);
  
  // Directives configuration
  let directives = Storage.getItem('ese_directives', []);

const getTotalChaptersShouldExist = () => {
      const elapsed = Date.now() - STORY_START;
      if (elapsed <= 0) return 1;
      return Math.min(MAX_CHAPTERS, Math.max(1, Math.floor(elapsed / CHAPTER_INTERVAL_MS)));
    };

const addSidebarItem = (chapter) => {
      const list = DOMHelpers.safeGetElement('sidebarList');
      if (!list) { console.warn('sidebarList not found, skipping sidebar item'); return; }
      const item = document.createElement('div');
      item.className = 'sidebar-item';
      item.dataset.num = chapter.number;
      item.onclick = () => {
        showNotification(`Clicked chapter ${chapter.number}: ${chapter.title}`);
        showChapter(chapter.number);
        if (window.innerWidth < 768) toggleSidebar();
      };
      item.innerHTML = `
        <span class="sidebar-item-num">${chapter.number}</span>
        <span class="sidebar-item-title">${chapter.title}</span>
      `;
      list.appendChild(item);
    };

const updateBadge = () => {
      const badge = DOMHelpers.safeGetElement('badgeCount');
      if (badge) {
        badge.textContent = AppState.totalGenerated;
      }
    };

const getChapterStats = (chapterNum) => {
      // Get MC state snapshot from the specific chapter
      const chapter = AppState.chapters[chapterNum - 1];
      if (chapter && chapter.mcSnapshot) {
        return { mc: chapter.mcSnapshot, tracker: chapter.trackerSnapshot };
      }
      // Fallback to current state
      return { mc: StoryEngine.getMcState(), tracker: StoryEngine.getStoryTracker() };
    };

const updateStatsBar = () => {
      // Stats bar removed from top — all stats now in dropdown menu
      updateDropdownStats();
    };

const updateTextSizeInput = () => {
      const input = DOMHelpers.safeGetElement('textSizeInput');
      if (input) {
        input.value = window.currentTextSize;
      }
    };

const initDropdownClose = () => {
      document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target)) closeDropdown();
      });
    };

const catchUpAndStart = () => {
          const startChapter = AppState.currentChapter || 1;
          const totalNeeded = AppState.totalGenerated || 0;

          showChapter(startChapter);
          updateStatsBar();
          updateDropdownStats();
          updateBadge();

          if (totalNeeded > 1) {
            safeShowNotification('chapter-notif', '📖 Story Loaded', `${totalNeeded.toLocaleString()} chapters ready!`);
          }

          // Schedule new chapters (only if not paused)
          const elapsed = Date.now() - STORY_START;
          const nextChapterIn = CHAPTER_INTERVAL_MS - (elapsed % CHAPTER_INTERVAL_MS);

          if (!AppState.paused) {
            setTimeout(() => {
              generateNewChapter();
              AppState.generationInterval = setInterval(generateNewChapter, CHAPTER_INTERVAL_MS);
            }, nextChapterIn);
          } else {
            // Update UI to show paused state
            const pauseIcon = DOMHelpers.safeGetElement('pauseIcon');
            const pauseLabel = DOMHelpers.safeGetElement('pauseLabel');
            const pauseBtn = DOMHelpers.safeGetElement('pauseBtn');
            const speedDisplay = DOMHelpers.safeGetElement('speedCurrentDisplay');
            
            if (pauseIcon) pauseIcon.textContent = '▶️';
            if (pauseLabel) pauseLabel.textContent = 'Resume Generation';
            if (pauseBtn) pauseBtn.classList.add('paused');
            if (speedDisplay) speedDisplay.innerHTML = '<strong style="color:#f87171;">⏸️ PAUSED</strong>';
          }
        };

const generateNewChapter = () => {
      // Check if generation should be limited by admin progress
      if (generationMode === 'admin_progress' && AppState.isAdmin) {
        if (AppState.totalGenerated >= AppState.currentChapter + 5) {
          // Stop generation if we're 5 chapters ahead of admin's reading
          if (AppState.generationInterval) {
            clearInterval(AppState.generationInterval);
            AppState.generationInterval = null;
          }
          safeShowNotification('combat-notif', '⏸️ Generation Paused', 'Waiting for admin to catch up...');
          return;
        }
      }

      const chapter = StoryEngine.generateChapter();
      AppState.chapters.push(chapter);
      AppState.totalGenerated = AppState.chapters.length;
      addSidebarItem(chapter);
      updateStatsBar();
      updateDropdownStats();
      updateBadge();

      safeShowNotification('chapter-notif', '📖 New Chapter', `Ch. ${chapter.number}: ${chapter.title}`);

      chapter.statChanges.forEach(change => {
        if (change.levelUp) safeShowNotification('level-notif', '⚔️ LEVEL UP!', `Kael reached Level ${change.val}!`);
        if (change.stat === "Extract") safeShowNotification('extract-notif', '🔮 Extraction!', `New item extracted!`);
        if (change.stat === "Boss") safeShowNotification('combat-notif', '💀 Boss Defeated!', `A powerful boss has been slain!`);
      });

      // Update nav buttons if user is on the last chapter
      if (AppState.currentChapter === AppState.totalGenerated - 1) {
        updateNavButtons();
      }
    }

const showChapter = (num) => {
      try {
        if (num < 1 || num > AppState.totalGenerated) {
          console.error(`❌ Invalid chapter number: ${num}. Must be between 1 and ${AppState.totalGenerated}`);
          return;
        }

        AppState.currentChapter = num;
      const chapter = AppState.chapters[num - 1];
      const container = DOMHelpers.safeGetElement('storyContainer');
      
      
      if (!container) {
        console.error('❌ storyContainer element not found!');
        showNotification('storyContainer element not found!');
        return;
      }
      
      if (!chapter) {
        console.error(`❌ Chapter ${num} not found in AppState.chapters`);
        showNotification(`Chapter ${num} not found in AppState.chapters`);
        return;
      }
      

      const settingIcon = chapter.setting === 'vr_world' ? '🎮' : '🌍';
      const typeIcon = getTypeIcon(chapter.type);

      let statTagsHtml = '';
      chapter.statChanges.forEach(change => {
        const isUp = change.val.toString().startsWith('+') || change.levelUp;
        statTagsHtml += `<span class="chapter-stat-tag"><span class="${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'}</span> ${change.stat}: ${change.val}</span>`;
      });

      container.innerHTML = `
        <div class="chapter" id="chapter-${chapter.number}">
          <div class="chapter-divider">
            <span class="chapter-divider-label">Chapter ${chapter.number} of ${AppState.totalGenerated}</span>
          </div>
          <div class="chapter-heading">
            <div class="chapter-title">${chapter.title}</div>
            <div class="chapter-meta-line">
              <span>${settingIcon} ${chapter.location}</span>
              <span>${typeIcon} ${chapter.type.replace(/_/g, ' ')}</span>
              <span>📝 ${chapter.wordCount}w</span>
              <span>📖 ${chapter.arc}</span>
            </div>
          </div>
          <div class="chapter-body" style="font-size: ${window.currentTextSize}px; line-height: ${window.currentTextSize * 1.7 / 16}em;">
            ${chapter.paragraphs.map((p, i) => i === 0 ? `<p class="first-para">${p}</p>` : `<p>${p}</p>`).join('')}
          </div>
          ${statTagsHtml ? `<div class="chapter-stats">${statTagsHtml}</div>` : ''}
        </div>
      `;

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Update nav
      updateNavButtons();

      // Update sidebar active
      document.querySelectorAll('.sidebar-item').forEach((item, i) => {
        if (item) {
          item.classList.toggle('active', i === num - 1);
        }
      });

      // Scroll sidebar to active item
      const activeItem = document.querySelector('.sidebar-item.active');
      if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });

      // Update topbar
      const navCurrentTop = DOMHelpers.safeGetElement('navCurrentTop');
      if (navCurrentTop) navCurrentTop.textContent = `Ch. ${num}`;
      const arcDisplay = DOMHelpers.safeGetElement('arcDisplay');
      if (arcDisplay) arcDisplay.textContent = `Arc: ${chapter.arc}`;

      // Update stats to reflect this chapter's state
      updateStatsBar();
      updateDropdownStats();

      // Save progress
      saveProgress();
    } catch (e) {
      console.error(`Error in showChapter: ${e.message}`);
      console.error(`Stack trace: ${e.stack}`);
      throw e;
    }
  };

const updateNavButtons = () => {
      const num = AppState.currentChapter;
      const total = AppState.totalGenerated;

      // Bottom nav
      const prevBtn = DOMHelpers.safeGetElement('prevBtn');
      const nextBtn = DOMHelpers.safeGetElement('nextBtn');

      if (prevBtn) {
        if (num <= 1) {
          prevBtn.classList.add('disabled');
          const prevTitle = DOMHelpers.safeGetElement('prevTitle');
          if (prevTitle) prevTitle.textContent = '';
        } else {
          prevBtn.classList.remove('disabled');
          const prevTitle = DOMHelpers.safeGetElement('prevTitle');
          if (prevTitle) prevTitle.textContent = AppState.chapters[num - 2].title;
        }
      }

      if (nextBtn) {
        if (num >= total) {
          nextBtn.classList.add('disabled');
          const nextTitle = DOMHelpers.safeGetElement('nextTitle');
          if (nextTitle) nextTitle.textContent = 'Waiting for next chapter...';
        } else {
          nextBtn.classList.remove('disabled');
          const nextTitle = DOMHelpers.safeGetElement('nextTitle');
          if (nextTitle) nextTitle.textContent = AppState.chapters[num].title;
        }
      }

      // Top nav
      const prevBtnTop = DOMHelpers.safeGetElement('prevBtnTop');
      const nextBtnTop = DOMHelpers.safeGetElement('nextBtnTop');
      if (prevBtnTop) prevBtnTop.disabled = num <= 1;
      if (nextBtnTop) nextBtnTop.disabled = num >= total;
    }

const updateDropdownStats = () => {
      const { mc, tracker } = getChapterStats(AppState.currentChapter);
      const isLatest = AppState.currentChapter === AppState.totalGenerated;

      // Update chapter indicator
      const chapterIndicator = DOMHelpers.safeGetElement('ddChapterIndicator');
      if (chapterIndicator) {
        if (isLatest) {
          chapterIndicator.innerHTML = `<span class="dd-chapter-badge latest">📖 Latest — Ch. ${AppState.currentChapter}</span>`;
        } else {
          chapterIndicator.innerHTML = `<span class="dd-chapter-badge viewing">📖 Viewing Ch. ${AppState.currentChapter} of ${AppState.totalGenerated}</span>`;
        }
      }

      // Show/hide jump to latest button
      const jumpBtn = DOMHelpers.safeGetElement('ddJumpLatest');
      if (jumpBtn) jumpBtn.style.display = isLatest ? 'none' : 'flex';

      const ddLevel = DOMHelpers.safeGetElement('ddLevel');
      if (ddLevel) ddLevel.textContent = mc.level;
      const ddLevelBottom = DOMHelpers.safeGetElement('ddLevelBottom');
      if (ddLevelBottom) ddLevelBottom.textContent = mc.level;
      const ddBarHp = DOMHelpers.safeGetElement('ddBarHp');
      if (ddBarHp) ddBarHp.style.width = (mc.hp / mc.maxHp * 100) + '%';
      const ddHpVal = DOMHelpers.safeGetElement('ddHpVal');
      if (ddHpVal) ddHpVal.textContent = `${mc.hp}/${mc.maxHp}`;
      const ddBarSp = DOMHelpers.safeGetElement('ddBarSp');
      if (ddBarSp) ddBarSp.style.width = (mc.sp / mc.maxSp * 100) + '%';
      const ddSpVal = DOMHelpers.safeGetElement('ddSpVal');
      if (ddSpVal) ddSpVal.textContent = `${mc.sp}/${mc.maxSp}`;
      const ddBarMp = DOMHelpers.safeGetElement('ddBarMp');
      if (ddBarMp) ddBarMp.style.width = (mc.mp / mc.maxMp * 100) + '%';
      const ddMpVal = DOMHelpers.safeGetElement('ddMpVal');
      if (ddMpVal) ddMpVal.textContent = `${mc.mp}/${mc.maxMp}`;
      const ddBarBlood = DOMHelpers.safeGetElement('ddBarBlood');
      if (ddBarBlood) ddBarBlood.style.width = (mc.bloodEssence / mc.maxBloodEssence * 100) + '%';
      const ddBloodVal = DOMHelpers.safeGetElement('ddBloodVal');
      if (ddBloodVal) ddBloodVal.textContent = `${mc.bloodEssence}/${mc.maxBloodEssence}`;
      const ddStr = DOMHelpers.safeGetElement('ddStr');
      if (ddStr) ddStr.textContent = mc.strength;
      const ddAgi = DOMHelpers.safeGetElement('ddAgi');
      if (ddAgi) ddAgi.textContent = mc.agility;
      const ddInt = DOMHelpers.safeGetElement('ddInt');
      if (ddInt) ddInt.textContent = mc.intelligence;
      const ddVit = DOMHelpers.safeGetElement('ddVit');
      if (ddVit) ddVit.textContent = mc.vitality;
      const ddEnd = DOMHelpers.safeGetElement('ddEnd');
      if (ddEnd) ddEnd.textContent = mc.endurance;
      const ddLuck = DOMHelpers.safeGetElement('ddLuck');
      if (ddLuck) ddLuck.textContent = mc.luck;
      const ddBloodlust = DOMHelpers.safeGetElement('ddBloodlust');
      if (ddBloodlust) ddBloodlust.textContent = mc.bloodlust;
      const ddDark = DOMHelpers.safeGetElement('ddDark');
      if (ddDark) ddDark.textContent = mc.darkAffinity;
      const ddRegen = DOMHelpers.safeGetElement('ddRegen');
      if (ddRegen) ddRegen.textContent = mc.regeneration;
      const ddDom = DOMHelpers.safeGetElement('ddDom');
      if (ddDom) ddDom.textContent = mc.domination;
      const ddAtk = DOMHelpers.safeGetElement('ddAtk');
      if (ddAtk) ddAtk.textContent = mc.attackPower;
      const ddDef = DOMHelpers.safeGetElement('ddDef');
      if (ddDef) ddDef.textContent = mc.defense;
      const ddCrit = DOMHelpers.safeGetElement('ddCrit');
      if (ddCrit) ddCrit.textContent = mc.criticalRate + '%';
      const ddEva = DOMHelpers.safeGetElement('ddEva');
      if (ddEva) ddEva.textContent = mc.evasion + '%';
      const ddKarma = DOMHelpers.safeGetElement('ddKarma');
      if (ddKarma) ddKarma.textContent = mc.karma;
      const ddInstinct = DOMHelpers.safeGetElement('ddInstinct');
      if (ddInstinct) ddInstinct.textContent = mc.instinct;
      const ddWill = DOMHelpers.safeGetElement('ddWill');
      if (ddWill) ddWill.textContent = mc.willpower;
      const ddPresence = DOMHelpers.safeGetElement('ddPresence');
      if (ddPresence) ddPresence.textContent = mc.presence;
      const ddGold = DOMHelpers.safeGetElement('ddGold');
      if (ddGold) ddGold.textContent = mc.gold.toLocaleString();
      const ddExtract = DOMHelpers.safeGetElement('ddExtract');
      if (ddExtract) ddExtract.textContent = mc.extractionCount;
      const ddKills = DOMHelpers.safeGetElement('ddKills');
      if (ddKills) ddKills.textContent = mc.killCount;
      const ddBosses = DOMHelpers.safeGetElement('ddBosses');
      if (ddBosses) ddBosses.textContent = mc.bossesDefeated;
      const ddDungeons = DOMHelpers.safeGetElement('ddDungeons');
      if (ddDungeons) ddDungeons.textContent = mc.dungeonsCleared;
      const ddLocation = DOMHelpers.safeGetElement('ddLocation');
      if (ddLocation) ddLocation.textContent = mc.currentLocation;
      const ddChapters = DOMHelpers.safeGetElement('ddChapters');
      if (ddChapters) ddChapters.textContent = `${AppState.currentChapter} / ${AppState.totalGenerated}`;
      const ddWords = DOMHelpers.safeGetElement('ddWords');
      if (ddWords) ddWords.textContent = tracker.totalWords.toLocaleString();
    }

const jumpToLatestChapter = () => {
      showChapter(AppState.totalGenerated);
      closeDropdown();
    }

const getTypeIcon = (type) => {
      const icons = {
        exploration: '🗺️', combat: '⚔️', boss_fight: '💀', dialogue: '💬',
        introspection: '🧠', training: '🏋️', extraction: '🔮', real_world: '🌍',
        social: '👥', lore_discovery: '📜', dungeon: '🏰', skill_evolution: '✨',
        vampire_power: '🧛', crafting: '🔨', economy: '💰', relationship: '❤️',
        flashback: '⏪', world_event: '🌐', stealth: '🥷', investigation: '🔍',
        clan_guild: '🏴', pvp: '⚡', quest: '📋', travel: '🚶',
        rest_recovery: '😴', nightmare_vision: '👁️', sister_moment: '💐',
        mentor_lesson: '📚', rival_encounter: '🤺', romance_scene: '💕'
      };
      return icons[type] || '📖';
    }

const sendResetEmail = () => {
      const email = DOMHelpers.safeGetElement('resetEmail').value.trim();
      if (!email || !email.includes('@')) {
        safeShowNotification('combat-notif', '❌ Error', 'Please enter a valid email address.');
        return;
      }

      // Find user by email
      const users = getUsers();
      const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        safeShowNotification('combat-notif', '❌ Error', 'No account found with this email address.');
        return;
      }

      // Store pending reset
      resetPendingUser = user.username;
      Storage.setItem('ese_resetPending', user.username);

      // Show success screen
      DOMHelpers.safeGetElement('resetStep1').style.display = 'none';
      DOMHelpers.safeGetElement('resetStep2').style.display = 'block';
      DOMHelpers.safeSetText('resetEmailDisplay', email);

      safeShowNotification('level-notif', '📧 Email Sent', `Reset link sent to ${email}`);
    }

const simulateResetLink = () => {
      // Simulate clicking the email link
      DOMHelpers.safeGetElement('resetStep2').style.display = 'none';
      DOMHelpers.safeGetElement('resetStep3').style.display = 'block';
    }

const resetPassword = () => {
      const newPassword = DOMHelpers.safeGetElement('resetNewPassword').value;

      if (!newPassword || newPassword.length < 4) {
        safeShowNotification('combat-notif', '❌ Error', 'Password must be at least 4 characters.');
        return;
      }

      if (newPassword !== confirmPassword) {
        safeShowNotification('combat-notif', '❌ Error', 'Passwords do not match.');
        return;
      }

      const username = resetPendingUser || Storage.getItem('ese_resetPending');
      if (!username) {
        safeShowNotification('combat-notif', '❌ Error', 'Reset session expired. Please try again.');
        closeModal('resetPasswordOverlay');
        return;
      }

      // Update user password
      const users = getUsers();
      const userIndex = users.findIndex(u => u.username === username);

      if (userIndex === -1) {
        safeShowNotification('combat-notif', '❌ Error', 'User not found.');
        return;
      }

      users[userIndex].password = newPassword;
      saveUsers(users);

      // Clear pending reset
      resetPendingUser = null;
      Storage.removeItem('ese_resetPending');

      // Show success screen
      DOMHelpers.safeGetElement('resetStep3').style.display = 'none';
      DOMHelpers.safeGetElement('resetStep4').style.display = 'block';

      safeShowNotification('level-notif', '✅ Password Reset', 'Your password has been updated!');
    }

const logout = () => {
      saveProgress();
      AppState.currentUser = null;
      AppState.isAdmin = false;
      DOMHelpers.safeGetElement('dropdownAuthSection').style.display = 'block';
      DOMHelpers.safeGetElement('dropdownUserSection').style.display = 'none';
      DOMHelpers.safeGetElement('dropdownDirectorSection').style.display = 'none';
      DOMHelpers.safeToggleClass('dropdownUserInfo', 'admin-info', false);
      Storage.removeItem('ese_currentUser');
      safeShowNotification('chapter-notif', '👋 Logged Out', 'See you next time!');
    }

const checkSavedLogin = () => {
      const saved = Storage.getItem('ese_currentUser');
      if (saved) { try { loginUser(JSON.parse(saved)); } catch (e) { Storage.removeItem('ese_currentUser'); } }
    }

const saveProgress = () => {
      if (!AppState.currentUser || AppState.isAdmin) return;
      const users = getUsers();
      const idx = users.findIndex(u => u.username === AppState.currentUser.username);
      if (idx !== -1) {
        users[idx].progress = { lastChapter: AppState.currentChapter, savedAt: Date.now() };
        saveUsers(users);
      }
    }

const setChapterSpeed = (ms) => {
      CHAPTER_INTERVAL_MS = ms;
      Storage.setItem('ese_chapterInterval', ms);

      // Restart the generation interval (only if not paused)
      if (!AppState.paused) {
        if (AppState.generationInterval) {
          clearInterval(AppState.generationInterval);
        }
        AppState.generationInterval = setInterval(generateNewChapter, CHAPTER_INTERVAL_MS);
      }

      // Update UI

      // Reset pause display if speed changed while paused
      if (AppState.paused) {
        DOMHelpers.safeGetElement('speedCurrentDisplay').innerHTML = `<strong style="color:#f87171;">⏸️ PAUSED</strong> <span style="color:rgba(255,255,255,0.4);font-size:11px;">(${formatSpeed(ms)} when resumed)</span>`;
      }

      safeShowNotification('level-notif', '⏱️ Speed Changed', `New chapter every ${formatSpeed(ms)}${AppState.paused ? ' (paused)' : ''}`);
    }

const setCustomSpeed = () => {
      const seconds = parseInt(DOMHelpers.safeGetElement('customSpeedInput').value);
      if (!seconds || seconds < 1) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a valid number of seconds (min: 1)');
        return;
      }
      if (seconds > 3600) {
        safeShowNotification('combat-notif', '❌ Error', 'Maximum is 3600 seconds (1 hour)');
        return;
      }
      setChapterSpeed(seconds * 1000);
      DOMHelpers.safeGetElement('customSpeedInput').value = '';
    }

const formatSpeed = (ms) => {
      if (ms < 60000) return (ms / 1000) + 's';
      if (ms < 3600000) return (ms / 60000) + 'm';
      return (ms / 3600000).toFixed(1) + 'h';
    }

const toggleDirectorMode = () => {
      directorMode = !directorMode;
      const directorScreen = DOMHelpers.safeGetElement('directorScreen');
      const mainContent = DOMHelpers.safeGetElement('mainContent');
      const sidebar = DOMHelpers.safeGetElement('sidebar');
      const topbar = document.querySelector('.topbar');

      if (directorMode) {
        // Switch to Director Mode
        directorScreen.style.display = 'block';
        mainContent.style.display = 'none';
        sidebar.style.display = 'none';
        topbar.style.display = 'none';
        document.body.style.overflow = 'auto';
        safeShowNotification('level-notif', '🎬 Director Mode', 'Full director panel activated!');
      } else {
        // Switch to Reader Mode
        directorScreen.style.display = 'none';
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        topbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
        safeShowNotification('level-notif', '📖 Reader Mode', 'Back to reading!');
      }
    }

const showDirectorModeToggle = () => {
      const toggleHint = DOMHelpers.safeGetElement('duiToggleHint');
      if (toggleHint) {
        toggleHint.style.display = 'block';
      }
    }

const hideDirectorModeToggle = () => {
      const toggleHint = DOMHelpers.safeGetElement('duiToggleHint');
      if (toggleHint) {
        toggleHint.style.display = 'none';
      }
    }

const toggleDirectorModeFromUser = () => {
      if (!AppState.isAdmin) return;
      toggleDirectorMode();
      closeDropdown();
    }

const toggleSection = (sectionId) => {
      const section = DOMHelpers.safeGetElement(sectionId);
      const button = section.previousElementSibling;
      const isHidden = section.style.display === 'none' || section.style.display === '';
      
      section.style.display = isHidden ? 'block' : 'none';
      button.setAttribute('aria-expanded', isHidden);
    }

const toggleStatusScreen = () => {
      statusScreenOpen = !statusScreenOpen;
      const statusScreen = DOMHelpers.safeGetElement('statusScreen');
      const mainContent = DOMHelpers.safeGetElement('mainContent');
      const sidebar = DOMHelpers.safeGetElement('sidebar');
      const topbar = document.querySelector('.topbar');

      if (statusScreenOpen) {
        statusScreen.style.display = 'block';
        mainContent.style.display = 'none';
        sidebar.style.display = 'none';
        topbar.style.display = 'none';
        document.body.style.overflow = 'auto';
        updateStatusScreen();
        safeShowNotification('level-notif', '📊 Status Screen', 'Full status view activated!');
      } else {
        statusScreen.style.display = 'none';
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        topbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
      }
    }

const updateStatusScreen = () => {
      if (!AppState.chapters.length) return;
      
      const currentChapter = AppState.chapters[AppState.currentChapter - 1];
      if (!currentChapter || !currentChapter.mcSnapshot) return;
      
      const mc = currentChapter.mcSnapshot;
      
      // Update character info
      DOMHelpers.safeSetText('statusLevel', mc.level);
      DOMHelpers.safeSetText('statusExtractions', mc.extractionCount || 0);
      
      // Update core stats
      DOMHelpers.safeSetText('statusHP', mc.hp);
      DOMHelpers.safeSetText('statusSP', mc.sp);
      DOMHelpers.safeSetText('statusMP', mc.mp);
      DOMHelpers.safeSetText('statusBloodEssence', mc.bloodEssence);
      
      // Update primary stats
      DOMHelpers.safeSetText('statusSTR', mc.strength);
      DOMHelpers.safeSetText('statusAGI', mc.agility);
      DOMHelpers.safeSetText('statusINT', mc.intelligence);
      DOMHelpers.safeSetText('statusVIT', mc.vitality);
      DOMHelpers.safeSetText('statusEND', mc.endurance);
      DOMHelpers.safeSetText('statusLUCK', mc.luck);
      
      // Update vampire stats
      DOMHelpers.safeSetText('statusBloodlust', mc.bloodlust);
      DOMHelpers.safeSetText('statusDarkAffinity', mc.darkAffinity);
      DOMHelpers.safeSetText('statusRegeneration', mc.regeneration);
      DOMHelpers.safeSetText('statusDomination', mc.domination);
      
      // Update combat stats
      DOMHelpers.safeSetText('statusAttackPower', mc.attackPower);
      DOMHelpers.safeSetText('statusDefense', mc.defense);
      DOMHelpers.safeSetText('statusCriticalRate', mc.criticalRate + '%');
      DOMHelpers.safeSetText('statusEvasion', mc.evasion + '%');
      DOMHelpers.safeSetText('statusAttackSpeed', mc.attackSpeed);
      
      // Update hidden stats
      DOMHelpers.safeSetText('statusKarma', mc.karma);
      DOMHelpers.safeSetText('statusInstinct', mc.instinct);
      DOMHelpers.safeSetText('statusWillpower', mc.willpower);
      DOMHelpers.safeSetText('statusPresence', mc.presence);
      
      // Update skills
      const skillsContainer = DOMHelpers.safeGetElement('statusSkills');
      if (mc.skills && mc.skills.length > 0) {
        skillsContainer.innerHTML = mc.skills.map(skill => `
          <div class="status-item">
            <div class="status-item-name">${skill.name}</div>
            <div class="status-item-desc">${skill.description || 'No description'}</div>
            <div class="status-item-meta">Level: ${skill.level || 1}</div>
          </div>
        `).join('');
      } else {
        skillsContainer.innerHTML = '<div class="status-empty">No skills yet</div>';
      }
      
      // Update abilities
      const abilitiesContainer = DOMHelpers.safeGetElement('statusAbilities');
      if (mc.abilities && mc.abilities.length > 0) {
        abilitiesContainer.innerHTML = mc.abilities.map(ability => `
          <div class="status-item">
            <div class="status-item-name">${ability.name}</div>
            <div class="status-item-desc">${ability.description || 'No description'}</div>
            <div class="status-item-meta">Rank: ${ability.rank || 'E'}</div>
          </div>
        `).join('');
      } else {
        abilitiesContainer.innerHTML = '<div class="status-empty">No abilities yet</div>';
      }
      
      // Update inventory
      const inventoryContainer = DOMHelpers.safeGetElement('statusInventory');
      if (mc.inventory && mc.inventory.length > 0) {
        inventoryContainer.innerHTML = mc.inventory.map(item => `
          <div class="status-item">
            <div class="status-item-name">${item.name}</div>
            <div class="status-item-desc">${item.description || 'No description'}</div>
            <div class="status-item-meta">Rank: ${item.rank || 'Common'}</div>
          </div>
        `).join('');
      } else {
        inventoryContainer.innerHTML = '<div class="status-empty">No items yet</div>';
      }
    }


const submitDirectiveScreen = () => {
      const text = DOMHelpers.safeGetElement('directiveTextScreen').value.trim();
      const chapters = parseInt(DOMHelpers.safeGetElement('directiveChaptersScreen').value) || 3;
      if (!text) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a directive!');
        return;
      }
      submitDirective();
    }

const addStoryRule = () => {
      const text = DOMHelpers.safeGetElement('storyRuleText').value.trim();
      const type = DOMHelpers.safeGetElement('ruleType').value;
      if (!text) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a rule!');
        return;
      }
      storyRules.push({
        id: Date.now(),
        text: text,
        type: type,
        createdAt: new Date().toISOString(),
        active: true
      });
      Storage.setItem('ese_storyRules', storyRules);
      DOMHelpers.safeGetElement('storyRuleText').value = '';
      updateStoryRulesList();
      safeShowNotification('level-notif', '📜 Rule Added', `${type} rule: ${text.substring(0, 50)}...`);
    }

const updateStoryRulesList = () => {
      const list = DOMHelpers.safeGetElement('storyRulesList');
      if (storyRules.length === 0) {
        list.innerHTML = '<p style="color:rgba(255,255,255,0.4);font-size:12px;padding:10px;">No rules yet.</p>';
        return;
      }
      list.innerHTML = storyRules.map(r => `
        <div class="story-rule-item">
          <div style="flex:1;">
            <div style="font-weight:600;color:#c084fc;">${r.type.toUpperCase()}</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);">${r.text}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.4);">${new Date(r.createdAt).toLocaleString()}</div>
          </div>
          <button class="btn btn-sm btn-danger" onclick="removeStoryRule(${r.id})">✕</button>
        </div>
      `).join('');
    }

const removeStoryRule = (id) => {
      storyRules = storyRules.filter(r => r.id !== id);
      Storage.setItem('ese_storyRules', storyRules);
      updateStoryRulesList();
      safeShowNotification('combat-notif', '🗑️ Rule Removed', 'Story rule deleted.');
    }

const getActiveRules = () => {
      return storyRules.filter(r => r.active);
    }




const quickResetStory = () => {
      // Reset app state
      AppState.chapters = [];
      AppState.currentChapter = 1;
      AppState.totalGenerated = 0;
      
      // Clear generation interval
      if (AppState.generationInterval) {
        clearInterval(AppState.generationInterval);
        AppState.generationInterval = null;
      }
      
      // Reset story engine
      StoryEngine.reset();
      
      // Clear directives
      Storage.removeItem('ese_directives');
      
      // Update UI
      DOMHelpers.safeGetElement('storyContainer').innerHTML = '';
      updateChapterNav();
      updateStats();
      updateDirectiveList();
      
      // Restart generation
      catchUpAndStart();
    }


const submitDirective = () => {
      const text = DOMHelpers.safeGetElement('directiveText').value.trim();
      const chapters = parseInt(DOMHelpers.safeGetElement('directiveChapters').value) || 3;
      if (!text) { safeShowNotification('combat-notif', '❌ Error', 'Enter a directive!'); return; }
      StoryEngine.addDirective(text, chapters);
      safeShowNotification('level-notif', '👑 Directive Added', `Woven in within ${chapters} chapters`);
      DOMHelpers.safeGetElement('directiveText').value = '';
      DOMHelpers.safeGetElement('directiveChapters').value = '3';
      updateDirectiveList();
    }

const updateDirectiveList = () => {
      const list = DOMHelpers.safeGetElement('directiveList');
      const all = StoryEngine.getAllDirectives();
      if (all.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:10px;">No directives yet.</p>'; return; }
      list.innerHTML = all.map(d => `<div class="directive-item"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${d.text}">${d.text}</span><span class="directive-status ${d.status}">${d.status}</span></div>`).join('');
    }

const updateAdminCredentials = () => {
      const newUsername = DOMHelpers.safeGetElement('adminUsernameScreen').value.trim();
      const newPassword = DOMHelpers.safeGetElement('adminPasswordScreen').value;

      // Validate — at least one field must be filled
      if (!newUsername && !newPassword) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a new username or password.');
        return;
      }


      if (newPassword && newPassword.length < 4) {
        safeShowNotification('combat-notif', '❌ Error', 'Password must be at least 4 characters.');
        return;
      }

      if (newUsername && newUsername.length < 2) {
        safeShowNotification('combat-notif', '❌ Error', 'Username must be at least 2 characters.');
        return;
      }

      // Apply changes
      if (newUsername) {
        ADMIN_USER.username = newUsername;
        if (AppState.currentUser) AppState.currentUser.username = newUsername;
        DOMHelpers.safeSetText('dropdownUsername', newUsername);
      }
      if (newPassword) {
        ADMIN_USER.password = newPassword;
      }

      // Save to localStorage
      Storage.setAdminUser(ADMIN_USER);
      if (AppState.currentUser) {
        Storage.setItem('ese_currentUser', AppState.currentUser);
      }

      // Clear fields
      DOMHelpers.safeGetElement('adminUsernameScreen').value = '';
      DOMHelpers.safeGetElement('adminPasswordScreen').value = '';

      // Update display
      updateAdminCredsDisplay();

      const changed = [];
      if (newUsername) changed.push('username');
      if (newPassword) changed.push('password');
      safeShowNotification('level-notif', '💾 Saved', `Admin ${changed.join(' & ')} updated!`);
    }

const updateAdminCredsDisplay = () => {
      const el = DOMHelpers.safeGetElement('adminCurrentCreds');
      if (el) {
        el.innerHTML = `<span>Current: <strong>${ADMIN_USER.username}</strong> / <strong>${'•'.repeat(ADMIN_USER.password.length)}</strong></span>`;
      }
    }

const toggleAdminPwVisibility = () => {
      const input = DOMHelpers.safeGetElement('adminPasswordScreen');
      input.type = input.type === 'password' ? 'text' : 'password';
    }

const loadUserList = () => {
      const users = getUsers();
      const list = DOMHelpers.safeGetElement('userListScreen');
      const count = DOMHelpers.safeGetElement('userCountScreen');

      count.textContent = `${users.length} user${users.length !== 1 ? 's' : ''}`;

      if (users.length === 0) {
        list.innerHTML = '<p class="no-users">No users found</p>';
        return;
      }

      list.innerHTML = users.map(user => `
        <div class="user-item" data-username="${sanitizeAttribute(user.username.toLowerCase())}" data-email="${sanitizeAttribute((user.email || '').toLowerCase())}">
          <div class="user-info">
            <span class="user-name">${sanitizeHTML(user.username)}</span>
            <span class="user-email">${sanitizeHTML(user.email || 'No email')}</span>
            <span class="user-badges">
              ${user.isAdmin ? '<span class="badge admin">👑 Admin</span>' : ''}
              ${user.subscribed ? '<span class="badge premium">⭐ Premium</span>' : ''}
            </span>
          </div>
          <div class="user-actions">
            <button class="btn btn-sm btn-icon" onclick="editUserEmail('${sanitizeAttribute(user.username)}')" title="Edit Email">📧</button>
            <button class="btn btn-sm btn-icon btn-danger" onclick="deleteUser('${sanitizeAttribute(user.username)}')" title="Delete User">🗑️</button>
          </div>
        </div>
      `).join('');
    }

const filterUsers = () => {
      const query = DOMHelpers.safeGetElement('userSearchInputScreen').value.toLowerCase();
      const items = document.querySelectorAll('.user-item');

      items.forEach(item => {
        const username = item.dataset.username;
        const email = item.dataset.email;
        const matches = username.includes(query) || email.includes(query);
        item.style.display = matches ? 'flex' : 'none';
      });
    }

const deleteUser = (username) => {
      if (!confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
        return;
      }

      const users = getUsers();
      const filtered = users.filter(u => u.username !== username);

      if (filtered.length === users.length) {
        safeShowNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      saveUsers(filtered);
      loadUserList();
      safeShowNotification('level-notif', '🗑️ User Deleted', `User "${username}" has been deleted`);
    }

const editUserEmail = (username) => {
      const users = getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        safeShowNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      const newEmail = prompt(`Enter new email for ${username}:`, user.email || '');

      if (newEmail === null) return; // Cancelled

      if (newEmail && newEmail.trim() !== '') {
        const emailValidation = Validator.validate('email', newEmail.trim());
        if (!emailValidation.valid) {
          safeShowNotification('combat-notif', '❌ Invalid Email', emailValidation.error);
          return;
        }
      }

      // Check if email is already used by another user
      const emailExists = users.find(u => u.email && u.email.toLowerCase() === newEmail.toLowerCase() && u.username !== username);
      if (emailExists) {
        safeShowNotification('combat-notif', '❌ Error', 'This email is already associated with another account');
        return;
      }

      user.email = newEmail || '';
      saveUsers(users);
      loadUserList();
      safeShowNotification('level-notif', '📧 Email Updated', `Email for "${username}" has been ${newEmail ? 'updated' : 'removed'}`);
    }

const selectDonation = (amount) => {
      AppState.selectedDonation = amount;
      document.querySelectorAll('.donate-amount-btn').forEach(btn => btn.classList.toggle('selected', btn.textContent === `$${amount}`));
      DOMHelpers.safeGetElement('donateCustom').value = '';
    }

const openPayPalDonation = () => {
      const custom = DOMHelpers.safeGetElement('donateCustom').value;
      const amount = custom ? parseFloat(custom) : AppState.selectedDonation;
      if (!amount || amount <= 0) { safeShowNotification('combat-notif', '❌ Error', 'Select or enter a donation amount!'); return; }
      AppState.selectedDonation = amount;
      // Open PayPal payment link in new tab
      window.open(PAYPAL_QR_LINK, '_blank');
      safeShowNotification('level-notif', '🔗 PayPal Opened', `Send $${amount.toFixed(2)} via PayPal to complete your donation.`);
      // Show confirmation step after a short delay
      setTimeout(() => {
        DOMHelpers.safeGetElement('donateStep1').querySelector('.paypal-confirm-section').style.display = 'block';
      }, 500);
    }

const confirmDonation = () => {
      DOMHelpers.safeGetElement('donateStep1').style.display = 'none';
      DOMHelpers.safeGetElement('donateStep3').style.display = 'block';
      safeShowNotification('level-notif', '💰 Thank You!', `Your generous donation is appreciated!`);
    }

const closeDonateModal = () => {
      closeModal('donateOverlay');
      setTimeout(() => {
        DOMHelpers.safeGetElement('donateStep1').style.display = 'block';
        DOMHelpers.safeGetElement('donateStep3').style.display = 'none';
        const confirmSec = DOMHelpers.safeGetElement('donateStep1').querySelector('.paypal-confirm-section');
        if (confirmSec) confirmSec.style.display = 'none';
        DOMHelpers.safeGetElement('donateCustom').value = '';
        DOMHelpers.safeGetElement('donateMessage').value = '';
        AppState.selectedDonation = null;
        document.querySelectorAll('.donate-amount-btn').forEach(b => b.classList.remove('selected'));
      }, 300);
    }

const openPayPalSubscription = () => {
      window.open(PAYPAL_QR_LINK, '_blank');
      safeShowNotification('level-notif', '🔗 PayPal Opened', 'Send $4.99 via PayPal and include "Subscribe" in the note.');
    }

const confirmSubscription = () => {
      DOMHelpers.safeGetElement('subStep1').style.display = 'none';
      DOMHelpers.safeGetElement('subStep3').style.display = 'block';
      if (AppState.currentUser) {
        AppState.currentUser.subscribed = true;
        const users = getUsers();
        const idx = users.findIndex(u => u.username === AppState.currentUser.username);
        if (idx !== -1) { users[idx].subscribed = true; saveUsers(users); }
        DOMHelpers.safeSetText('dropdownUserIcon', '⭐');
        DOMHelpers.safeSetText('dropdownUserRole', 'Premium Reader');
        Storage.setItem('ese_currentUser', AppState.currentUser);
      }
      safeShowNotification('level-notif', '⭐ Subscribed!', 'Welcome to the premium experience!');
    }

const closeSubModal = () => {
      closeModal('subscribeOverlay');
      setTimeout(() => {
        DOMHelpers.safeGetElement('subStep1').style.display = 'block';
        DOMHelpers.safeGetElement('subStep3').style.display = 'none';
      }, 300);
    }

  // Create namespace object
  const MiscFunctions = {
    catchUpAndStart: catchUpAndStart,
    generateNewChapter: generateNewChapter,
    showChapter: showChapter,
    updateNavButtons: updateNavButtons,
    updateDropdownStats: updateDropdownStats,
    jumpToLatestChapter: jumpToLatestChapter,
    getTypeIcon: getTypeIcon,
    sendResetEmail: sendResetEmail,
    simulateResetLink: simulateResetLink,
    resetPassword: resetPassword,
    logout: logout,
    checkSavedLogin: checkSavedLogin,
    saveProgress: saveProgress,
    setChapterSpeed: setChapterSpeed,
    setCustomSpeed: setCustomSpeed,
    formatSpeed: formatSpeed,
    toggleDirectorMode: toggleDirectorMode,
    showDirectorModeToggle: showDirectorModeToggle,
    hideDirectorModeToggle: hideDirectorModeToggle,
    toggleDirectorModeFromUser: toggleDirectorModeFromUser,
    toggleSection: toggleSection,
    toggleStatusScreen: toggleStatusScreen,
    updateStatusScreen: updateStatusScreen,
    submitDirectiveScreen: submitDirectiveScreen,
    addStoryRule: addStoryRule,
    updateStoryRulesList: updateStoryRulesList,
    removeStoryRule: removeStoryRule,
    getActiveRules: getActiveRules,
    quickResetStory: quickResetStory,
    submitDirective: submitDirective,
    updateDirectiveList: updateDirectiveList,
    updateAdminCredentials: updateAdminCredentials,
    updateAdminCredsDisplay: updateAdminCredsDisplay,
    toggleAdminPwVisibility: toggleAdminPwVisibility,
    loadUserList: loadUserList,
    filterUsers: filterUsers,
    deleteUser: deleteUser,
    editUserEmail: editUserEmail,
    selectDonation: selectDonation,
    openPayPalDonation: openPayPalDonation,
    confirmDonation: confirmDonation,
    closeDonateModal: closeDonateModal,
    openPayPalSubscription: openPayPalSubscription,
    confirmSubscription: confirmSubscription,
    closeSubModal: closeSubModal,
    generationMode: generationMode
  };
  
  // Export to global scope
  if (typeof window !== 'undefined') {
    window.MiscFunctions = MiscFunctions;
    // Also export individual functions for backward compatibility
    window.getTotalChaptersShouldExist = getTotalChaptersShouldExist;
    window.addSidebarItem = addSidebarItem;
    window.updateBadge = updateBadge;
    window.getChapterStats = getChapterStats;
    window.updateStatsBar = updateStatsBar;
    window.catchUpAndStart = catchUpAndStart;
    window.generateNewChapter = generateNewChapter;
    window.showChapter = showChapter;
    window.updateNavButtons = updateNavButtons;
    window.updateDropdownStats = updateDropdownStats;
    window.jumpToLatestChapter = jumpToLatestChapter;
    window.getTypeIcon = getTypeIcon;
    window.sendResetEmail = sendResetEmail;
    window.simulateResetLink = simulateResetLink;
    window.resetPassword = resetPassword;
    window.logout = logout;
    window.checkSavedLogin = checkSavedLogin;
    window.saveProgress = saveProgress;
    window.setChapterSpeed = setChapterSpeed;
    window.setCustomSpeed = setCustomSpeed;
    window.formatSpeed = formatSpeed;
    window.showDirectorModeToggle = showDirectorModeToggle;
    window.hideDirectorModeToggle = hideDirectorModeToggle;
    window.toggleDirectorModeFromUser = toggleDirectorModeFromUser;
    window.toggleSection = toggleSection;
    window.toggleStatusScreen = toggleStatusScreen;
    window.updateStatusScreen = updateStatusScreen;
    window.submitDirectiveScreen = submitDirectiveScreen;
    window.addStoryRule = addStoryRule;
    window.updateStoryRulesList = updateStoryRulesList;
    window.removeStoryRule = removeStoryRule;
    window.getActiveRules = getActiveRules;
    window.quickResetStory = quickResetStory;
    window.submitDirective = submitDirective;
    window.updateDirectiveList = updateDirectiveList;
    window.updateAdminCredentials = updateAdminCredentials;
    window.updateAdminCredsDisplay = updateAdminCredsDisplay;
    window.toggleAdminPwVisibility = toggleAdminPwVisibility;
    window.loadUserList = loadUserList;
    window.filterUsers = filterUsers;
    window.deleteUser = deleteUser;
    window.editUserEmail = editUserEmail;
    window.selectDonation = selectDonation;
    window.openPayPalDonation = openPayPalDonation;
    window.confirmDonation = confirmDonation;
    window.closeDonateModal = closeDonateModal;
    window.openPayPalSubscription = openPayPalSubscription;
    window.confirmSubscription = confirmSubscription;
    window.closeSubModal = closeSubModal;
    window.updateTextSizeInput = updateTextSizeInput;
    window.initDropdownClose = initDropdownClose;
    window.generationMode = generationMode;
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiscFunctions;
  }
})();
