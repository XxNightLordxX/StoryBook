/**
 * Miscellaneous functions
 * Extracted from index.html
 */

window.miscJsLoaded = true;

(function() {
  
  // Safe showNotification wrapper - prevents crashes if notifications UI hasn't loaded yet
  const safeShowNotification = (...args) => {
    if (typeof showNotification === 'function') {
      showNotification(...args);
    } else if (typeof window.showNotification === 'function') {
      window.showNotification(...args);
    } else {
      console.log('[Notification]', ...args);
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
      const list = document.getElementById('sidebarList');
      if (!list) { console.warn('sidebarList not found, skipping sidebar item'); return; }
      const item = document.createElement('div');
      item.className = 'sidebar-item';
      item.dataset.num = chapter.number;
      item.onclick = () => {
        alert(`Clicked chapter ${chapter.number}: ${chapter.title}`);
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
      const badge = document.getElementById('badgeCount');
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
      const input = document.getElementById('textSizeInput');
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
            const pauseIcon = document.getElementById('pauseIcon');
            const pauseLabel = document.getElementById('pauseLabel');
            const pauseBtn = document.getElementById('pauseBtn');
            const speedDisplay = document.getElementById('speedCurrentDisplay');
            
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
      updateAdminProgressInfo();

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
      const container = document.getElementById('storyContainer');
      
      
      if (!container) {
        console.error('❌ storyContainer element not found!');
        alert('storyContainer element not found!');
        return;
      }
      
      if (!chapter) {
        console.error(`❌ Chapter ${num} not found in AppState.chapters`);
        alert(`Chapter ${num} not found in AppState.chapters`);
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
      const navCurrentTop = document.getElementById('navCurrentTop');
      if (navCurrentTop) navCurrentTop.textContent = `Ch. ${num}`;
      const arcDisplay = document.getElementById('arcDisplay');
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
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');

      if (prevBtn) {
        if (num <= 1) {
          prevBtn.classList.add('disabled');
          const prevTitle = document.getElementById('prevTitle');
          if (prevTitle) prevTitle.textContent = '';
        } else {
          prevBtn.classList.remove('disabled');
          const prevTitle = document.getElementById('prevTitle');
          if (prevTitle) prevTitle.textContent = AppState.chapters[num - 2].title;
        }
      }

      if (nextBtn) {
        if (num >= total) {
          nextBtn.classList.add('disabled');
          const nextTitle = document.getElementById('nextTitle');
          if (nextTitle) nextTitle.textContent = 'Waiting for next chapter...';
        } else {
          nextBtn.classList.remove('disabled');
          const nextTitle = document.getElementById('nextTitle');
          if (nextTitle) nextTitle.textContent = AppState.chapters[num].title;
        }
      }

      // Top nav
      const prevBtnTop = document.getElementById('prevBtnTop');
      const nextBtnTop = document.getElementById('nextBtnTop');
      if (prevBtnTop) prevBtnTop.disabled = num <= 1;
      if (nextBtnTop) nextBtnTop.disabled = num >= total;
    }

const updateDropdownStats = () => {
      const { mc, tracker } = getChapterStats(AppState.currentChapter);
      const isLatest = AppState.currentChapter === AppState.totalGenerated;

      // Update chapter indicator
      const chapterIndicator = document.getElementById('ddChapterIndicator');
      if (chapterIndicator) {
        if (isLatest) {
          chapterIndicator.innerHTML = `<span class="dd-chapter-badge latest">📖 Latest — Ch. ${AppState.currentChapter}</span>`;
        } else {
          chapterIndicator.innerHTML = `<span class="dd-chapter-badge viewing">📖 Viewing Ch. ${AppState.currentChapter} of ${AppState.totalGenerated}</span>`;
        }
      }

      // Show/hide jump to latest button
      const jumpBtn = document.getElementById('ddJumpLatest');
      if (jumpBtn) jumpBtn.style.display = isLatest ? 'none' : 'flex';

      const ddLevel = document.getElementById('ddLevel');
      if (ddLevel) ddLevel.textContent = mc.level;
      const ddLevelBottom = document.getElementById('ddLevelBottom');
      if (ddLevelBottom) ddLevelBottom.textContent = mc.level;
      const ddBarHp = document.getElementById('ddBarHp');
      if (ddBarHp) ddBarHp.style.width = (mc.hp / mc.maxHp * 100) + '%';
      const ddHpVal = document.getElementById('ddHpVal');
      if (ddHpVal) ddHpVal.textContent = `${mc.hp}/${mc.maxHp}`;
      const ddBarSp = document.getElementById('ddBarSp');
      if (ddBarSp) ddBarSp.style.width = (mc.sp / mc.maxSp * 100) + '%';
      const ddSpVal = document.getElementById('ddSpVal');
      if (ddSpVal) ddSpVal.textContent = `${mc.sp}/${mc.maxSp}`;
      const ddBarMp = document.getElementById('ddBarMp');
      if (ddBarMp) ddBarMp.style.width = (mc.mp / mc.maxMp * 100) + '%';
      const ddMpVal = document.getElementById('ddMpVal');
      if (ddMpVal) ddMpVal.textContent = `${mc.mp}/${mc.maxMp}`;
      const ddBarBlood = document.getElementById('ddBarBlood');
      if (ddBarBlood) ddBarBlood.style.width = (mc.bloodEssence / mc.maxBloodEssence * 100) + '%';
      const ddBloodVal = document.getElementById('ddBloodVal');
      if (ddBloodVal) ddBloodVal.textContent = `${mc.bloodEssence}/${mc.maxBloodEssence}`;
      const ddStr = document.getElementById('ddStr');
      if (ddStr) ddStr.textContent = mc.strength;
      const ddAgi = document.getElementById('ddAgi');
      if (ddAgi) ddAgi.textContent = mc.agility;
      const ddInt = document.getElementById('ddInt');
      if (ddInt) ddInt.textContent = mc.intelligence;
      const ddVit = document.getElementById('ddVit');
      if (ddVit) ddVit.textContent = mc.vitality;
      const ddEnd = document.getElementById('ddEnd');
      if (ddEnd) ddEnd.textContent = mc.endurance;
      const ddLuck = document.getElementById('ddLuck');
      if (ddLuck) ddLuck.textContent = mc.luck;
      const ddBloodlust = document.getElementById('ddBloodlust');
      if (ddBloodlust) ddBloodlust.textContent = mc.bloodlust;
      const ddDark = document.getElementById('ddDark');
      if (ddDark) ddDark.textContent = mc.darkAffinity;
      const ddRegen = document.getElementById('ddRegen');
      if (ddRegen) ddRegen.textContent = mc.regeneration;
      const ddDom = document.getElementById('ddDom');
      if (ddDom) ddDom.textContent = mc.domination;
      const ddAtk = document.getElementById('ddAtk');
      if (ddAtk) ddAtk.textContent = mc.attackPower;
      const ddDef = document.getElementById('ddDef');
      if (ddDef) ddDef.textContent = mc.defense;
      const ddCrit = document.getElementById('ddCrit');
      if (ddCrit) ddCrit.textContent = mc.criticalRate + '%';
      const ddEva = document.getElementById('ddEva');
      if (ddEva) ddEva.textContent = mc.evasion + '%';
      const ddKarma = document.getElementById('ddKarma');
      if (ddKarma) ddKarma.textContent = mc.karma;
      const ddInstinct = document.getElementById('ddInstinct');
      if (ddInstinct) ddInstinct.textContent = mc.instinct;
      const ddWill = document.getElementById('ddWill');
      if (ddWill) ddWill.textContent = mc.willpower;
      const ddPresence = document.getElementById('ddPresence');
      if (ddPresence) ddPresence.textContent = mc.presence;
      const ddGold = document.getElementById('ddGold');
      if (ddGold) ddGold.textContent = mc.gold.toLocaleString();
      const ddExtract = document.getElementById('ddExtract');
      if (ddExtract) ddExtract.textContent = mc.extractionCount;
      const ddKills = document.getElementById('ddKills');
      if (ddKills) ddKills.textContent = mc.killCount;
      const ddBosses = document.getElementById('ddBosses');
      if (ddBosses) ddBosses.textContent = mc.bossesDefeated;
      const ddDungeons = document.getElementById('ddDungeons');
      if (ddDungeons) ddDungeons.textContent = mc.dungeonsCleared;
      const ddLocation = document.getElementById('ddLocation');
      if (ddLocation) ddLocation.textContent = mc.currentLocation;
      const ddChapters = document.getElementById('ddChapters');
      if (ddChapters) ddChapters.textContent = `${AppState.currentChapter} / ${AppState.totalGenerated}`;
      const ddWords = document.getElementById('ddWords');
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
      const email = document.getElementById('resetEmail').value.trim();
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
      document.getElementById('resetStep1').style.display = 'none';
      document.getElementById('resetStep2').style.display = 'block';
      document.getElementById('resetEmailDisplay').textContent = email;

      safeShowNotification('level-notif', '📧 Email Sent', `Reset link sent to ${email}`);
    }

const simulateResetLink = () => {
      // Simulate clicking the email link
      document.getElementById('resetStep2').style.display = 'none';
      document.getElementById('resetStep3').style.display = 'block';
    }

const resetPassword = () => {
      const newPassword = document.getElementById('resetNewPassword').value;

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
      document.getElementById('resetStep3').style.display = 'none';
      document.getElementById('resetStep4').style.display = 'block';

      safeShowNotification('level-notif', '✅ Password Reset', 'Your password has been updated!');
    }

const logout = () => {
      saveProgress();
      AppState.currentUser = null;
      AppState.isAdmin = false;
      document.getElementById('dropdownAuthSection').style.display = 'block';
      document.getElementById('dropdownUserSection').style.display = 'none';
      document.getElementById('dropdownDirectorSection').style.display = 'none';
      document.getElementById('dropdownUserInfo').classList.remove('admin-info');
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
      updateSpeedDisplay();
      highlightActiveSpeed();

      // Reset pause display if speed changed while paused
      if (AppState.paused) {
        document.getElementById('speedCurrentDisplay').innerHTML = `<strong style="color:#f87171;">⏸️ PAUSED</strong> <span style="color:rgba(255,255,255,0.4);font-size:11px;">(${formatSpeed(ms)} when resumed)</span>`;
      }

      safeShowNotification('level-notif', '⏱️ Speed Changed', `New chapter every ${formatSpeed(ms)}${AppState.paused ? ' (paused)' : ''}`);
    }

const setCustomSpeed = () => {
      const seconds = parseInt(document.getElementById('customSpeedInput').value);
      if (!seconds || seconds < 1) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a valid number of seconds (min: 1)');
        return;
      }
      if (seconds > 3600) {
        safeShowNotification('combat-notif', '❌ Error', 'Maximum is 3600 seconds (1 hour)');
        return;
      }
      setChapterSpeed(seconds * 1000);
      document.getElementById('customSpeedInput').value = '';
    }

const formatSpeed = (ms) => {
      if (ms < 60000) return (ms / 1000) + 's';
      if (ms < 3600000) return (ms / 60000) + 'm';
      return (ms / 3600000).toFixed(1) + 'h';
    }

const updateSpeedDisplay = () => {
      const display = document.getElementById('speedValueDisplay');
      if (display) display.textContent = formatSpeed(CHAPTER_INTERVAL_MS);
    }

const highlightActiveSpeed = () => {
      document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.speed) === CHAPTER_INTERVAL_MS);
      });
    }

const toggleDirectorMode = () => {
      directorMode = !directorMode;
      const directorScreen = document.getElementById('directorScreen');
      const mainContent = document.getElementById('mainContent');
      const sidebar = document.getElementById('sidebar');
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
      const toggleHint = document.getElementById('duiToggleHint');
      if (toggleHint) {
        toggleHint.style.display = 'block';
      }
    }

const hideDirectorModeToggle = () => {
      const toggleHint = document.getElementById('duiToggleHint');
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
      const section = document.getElementById(sectionId);
      const button = section.previousElementSibling;
      const isHidden = section.style.display === 'none' || section.style.display === '';
      
      section.style.display = isHidden ? 'block' : 'none';
      button.setAttribute('aria-expanded', isHidden);
    }

const toggleStatusScreen = () => {
      statusScreenOpen = !statusScreenOpen;
      const statusScreen = document.getElementById('statusScreen');
      const mainContent = document.getElementById('mainContent');
      const sidebar = document.getElementById('sidebar');
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
      document.getElementById('statusLevel').textContent = mc.level;
      document.getElementById('statusExtractions').textContent = mc.extractionCount || 0;
      
      // Update core stats
      document.getElementById('statusHP').textContent = mc.hp;
      document.getElementById('statusSP').textContent = mc.sp;
      document.getElementById('statusMP').textContent = mc.mp;
      document.getElementById('statusBloodEssence').textContent = mc.bloodEssence;
      
      // Update primary stats
      document.getElementById('statusSTR').textContent = mc.strength;
      document.getElementById('statusAGI').textContent = mc.agility;
      document.getElementById('statusINT').textContent = mc.intelligence;
      document.getElementById('statusVIT').textContent = mc.vitality;
      document.getElementById('statusEND').textContent = mc.endurance;
      document.getElementById('statusLUCK').textContent = mc.luck;
      
      // Update vampire stats
      document.getElementById('statusBloodlust').textContent = mc.bloodlust;
      document.getElementById('statusDarkAffinity').textContent = mc.darkAffinity;
      document.getElementById('statusRegeneration').textContent = mc.regeneration;
      document.getElementById('statusDomination').textContent = mc.domination;
      
      // Update combat stats
      document.getElementById('statusAttackPower').textContent = mc.attackPower;
      document.getElementById('statusDefense').textContent = mc.defense;
      document.getElementById('statusCriticalRate').textContent = mc.criticalRate + '%';
      document.getElementById('statusEvasion').textContent = mc.evasion + '%';
      document.getElementById('statusAttackSpeed').textContent = mc.attackSpeed;
      
      // Update hidden stats
      document.getElementById('statusKarma').textContent = mc.karma;
      document.getElementById('statusInstinct').textContent = mc.instinct;
      document.getElementById('statusWillpower').textContent = mc.willpower;
      document.getElementById('statusPresence').textContent = mc.presence;
      
      // Update skills
      const skillsContainer = document.getElementById('statusSkills');
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
      const abilitiesContainer = document.getElementById('statusAbilities');
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
      const inventoryContainer = document.getElementById('statusInventory');
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

const setCustomSpeedScreen = () => {
      const input = document.getElementById('customSpeedInputScreen');
      const ms = parseInt(input.value) * 1000;
      if (isNaN(ms) || ms < 1000 || ms > 3600000) {
        safeShowNotification('combat-notif', '❌ Invalid Speed', 'Enter a value between 1 and 3600 seconds');
        return;
      }
      setSpeed(ms);
    }

const submitDirectiveScreen = () => {
      const text = document.getElementById('directiveTextScreen').value.trim();
      const chapters = parseInt(document.getElementById('directiveChaptersScreen').value) || 3;
      if (!text) {
        safeShowNotification('combat-notif', '❌ Error', 'Enter a directive!');
        return;
      }
      submitDirective();
    }

const addStoryRule = () => {
      const text = document.getElementById('storyRuleText').value.trim();
      const type = document.getElementById('ruleType').value;
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
      document.getElementById('storyRuleText').value = '';
      updateStoryRulesList();
      safeShowNotification('level-notif', '📜 Rule Added', `${type} rule: ${text.substring(0, 50)}...`);
    }

const updateStoryRulesList = () => {
      const list = document.getElementById('storyRulesList');
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

const updateGenerationMode = () => {
      generationMode = document.getElementById('generationMode').value;
      Storage.setItem('ese_generationMode', generationMode);
      updateAdminProgressInfo();
      safeShowNotification('level-notif', '🎮 Mode Changed', `Generation: ${generationMode === 'unlimited' ? 'Unlimited' : 'Admin Progress'}`);
    }

const updateAdminProgressInfo = () => {
      const info = document.getElementById('adminProgressInfo');
      if (!info) return;
      if (generationMode === 'admin_progress') {
        info.style.display = 'block';
        const adminCh = document.getElementById('adminCurrentChapter');
        if (adminCh) adminCh.textContent = AppState.currentChapter;
        const genCount = document.getElementById('generatedChaptersCount');
        if (genCount) genCount.textContent = AppState.totalGenerated;
      } else {
        info.style.display = 'none';
      }
    }

const resetStory = () => {
      if (!confirm('⚠️ Are you sure you want to reset the story to Chapter 1?\n\nThis will:\n• Delete all generated chapters\n• Reset MC stats to level 1\n• Clear all directives\n• Keep story rules intact\n\nThis action cannot be undone!')) {
        return;
      }
      
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
      document.getElementById('storyContainer').innerHTML = '';
      updateChapterNav();
      updateStats();
      updateDirectiveList();
      
      // Restart generation
      catchUpAndStart();
      
      safeShowNotification('level-notif', '🔄 Story Reset', 'Story has been reset to Chapter 1!');
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
      document.getElementById('storyContainer').innerHTML = '';
      updateChapterNav();
      updateStats();
      updateDirectiveList();
      
      // Restart generation
      catchUpAndStart();
    }

const togglePause = () => {
      AppState.paused = !AppState.paused;
      const pauseIcon = document.getElementById('pauseIcon');
      const pauseLabel = document.getElementById('pauseLabel');
      const pauseBtn = document.getElementById('pauseBtn');
      const speedDisplay = document.getElementById('speedCurrentDisplay');

      if (AppState.paused) {
        // Pause — clear interval
        if (AppState.generationInterval) {
          clearInterval(AppState.generationInterval);
          AppState.generationInterval = null;
        }
        Storage.setPausedState(true);
        pauseIcon.textContent = '▶️';
        pauseLabel.textContent = 'Resume Generation';
        pauseBtn.classList.add('paused');
        speedDisplay.innerHTML = '<strong style="color:#f87171;">⏸️ PAUSED</strong>';
        safeShowNotification('combat-notif', '⏸️ Paused', 'Chapter generation paused.');
      } else {
        // Resume — restart interval
        Storage.setPausedState(false);
        generateNewChapter(); // Generate one immediately
        AppState.generationInterval = setInterval(generateNewChapter, CHAPTER_INTERVAL_MS);
        pauseIcon.textContent = '⏸️';
        pauseLabel.textContent = 'Pause Generation';
        pauseBtn.classList.remove('paused');
        updateSpeedDisplay();
        document.getElementById('speedCurrentDisplay').innerHTML = `Current: <strong>1 chapter every <span id="speedValueDisplay">${formatSpeed(CHAPTER_INTERVAL_MS)}</span></strong>`;
        safeShowNotification('level-notif', '▶️ Resumed', `Generating 1 chapter every ${formatSpeed(CHAPTER_INTERVAL_MS)}`);
      }
    }

const submitDirective = () => {
      const text = document.getElementById('directiveText').value.trim();
      const chapters = parseInt(document.getElementById('directiveChapters').value) || 3;
      if (!text) { safeShowNotification('combat-notif', '❌ Error', 'Enter a directive!'); return; }
      StoryEngine.addDirective(text, chapters);
      safeShowNotification('level-notif', '👑 Directive Added', `Woven in within ${chapters} chapters`);
      document.getElementById('directiveText').value = '';
      document.getElementById('directiveChapters').value = '3';
      updateDirectiveList();
    }

const updateDirectiveList = () => {
      const list = document.getElementById('directiveList');
      const all = StoryEngine.getAllDirectives();
      if (all.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:10px;">No directives yet.</p>'; return; }
      list.innerHTML = all.map(d => `<div class="directive-item"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${d.text}">${d.text}</span><span class="directive-status ${d.status}">${d.status}</span></div>`).join('');
    }

const updateAdminCredentials = () => {
      const newUsername = document.getElementById('adminUsernameScreen').value.trim();
      const newPassword = document.getElementById('adminPasswordScreen').value;

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
        document.getElementById('dropdownUsername').textContent = newUsername;
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
      document.getElementById('adminUsernameScreen').value = '';
      document.getElementById('adminPasswordScreen').value = '';

      // Update display
      updateAdminCredsDisplay();

      const changed = [];
      if (newUsername) changed.push('username');
      if (newPassword) changed.push('password');
      safeShowNotification('level-notif', '💾 Saved', `Admin ${changed.join(' & ')} updated!`);
    }

const updateAdminCredsDisplay = () => {
      const el = document.getElementById('adminCurrentCreds');
      if (el) {
        el.innerHTML = `<span>Current: <strong>${ADMIN_USER.username}</strong> / <strong>${'•'.repeat(ADMIN_USER.password.length)}</strong></span>`;
      }
    }

const toggleAdminPwVisibility = () => {
      const input = document.getElementById('adminPasswordScreen');
      input.type = input.type === 'password' ? 'text' : 'password';
    }

const loadUserList = () => {
      const users = getUsers();
      const list = document.getElementById('userListScreen');
      const count = document.getElementById('userCountScreen');

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
      const query = document.getElementById('userSearchInputScreen').value.toLowerCase();
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
      document.getElementById('donateCustom').value = '';
    }

const openPayPalDonation = () => {
      const custom = document.getElementById('donateCustom').value;
      const amount = custom ? parseFloat(custom) : AppState.selectedDonation;
      if (!amount || amount <= 0) { safeShowNotification('combat-notif', '❌ Error', 'Select or enter a donation amount!'); return; }
      AppState.selectedDonation = amount;
      // Open PayPal payment link in new tab
      window.open(PAYPAL_QR_LINK, '_blank');
      safeShowNotification('level-notif', '🔗 PayPal Opened', `Send $${amount.toFixed(2)} via PayPal to complete your donation.`);
      // Show confirmation step after a short delay
      setTimeout(() => {
        document.getElementById('donateStep1').querySelector('.paypal-confirm-section').style.display = 'block';
      }, 500);
    }

const confirmDonation = () => {
      document.getElementById('donateStep1').style.display = 'none';
      document.getElementById('donateStep3').style.display = 'block';
      safeShowNotification('level-notif', '💰 Thank You!', `Your generous donation is appreciated!`);
    }

const closeDonateModal = () => {
      closeModal('donateOverlay');
      setTimeout(() => {
        document.getElementById('donateStep1').style.display = 'block';
        document.getElementById('donateStep3').style.display = 'none';
        const confirmSec = document.getElementById('donateStep1').querySelector('.paypal-confirm-section');
        if (confirmSec) confirmSec.style.display = 'none';
        document.getElementById('donateCustom').value = '';
        document.getElementById('donateMessage').value = '';
        AppState.selectedDonation = null;
        document.querySelectorAll('.donate-amount-btn').forEach(b => b.classList.remove('selected'));
      }, 300);
    }

const openPayPalSubscription = () => {
      window.open(PAYPAL_QR_LINK, '_blank');
      safeShowNotification('level-notif', '🔗 PayPal Opened', 'Send $4.99 via PayPal and include "Subscribe" in the note.');
    }

const confirmSubscription = () => {
      document.getElementById('subStep1').style.display = 'none';
      document.getElementById('subStep3').style.display = 'block';
      if (AppState.currentUser) {
        AppState.currentUser.subscribed = true;
        const users = getUsers();
        const idx = users.findIndex(u => u.username === AppState.currentUser.username);
        if (idx !== -1) { users[idx].subscribed = true; saveUsers(users); }
        document.getElementById('dropdownUserIcon').textContent = '⭐';
        document.getElementById('dropdownUserRole').textContent = 'Premium Reader';
        Storage.setItem('ese_currentUser', AppState.currentUser);
      }
      safeShowNotification('level-notif', '⭐ Subscribed!', 'Welcome to the premium experience!');
    }

const closeSubModal = () => {
      closeModal('subscribeOverlay');
      setTimeout(() => {
        document.getElementById('subStep1').style.display = 'block';
        document.getElementById('subStep3').style.display = 'none';
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
    updateSpeedDisplay: updateSpeedDisplay,
    highlightActiveSpeed: highlightActiveSpeed,
    toggleDirectorMode: toggleDirectorMode,
    showDirectorModeToggle: showDirectorModeToggle,
    hideDirectorModeToggle: hideDirectorModeToggle,
    toggleDirectorModeFromUser: toggleDirectorModeFromUser,
    toggleSection: toggleSection,
    toggleStatusScreen: toggleStatusScreen,
    updateStatusScreen: updateStatusScreen,
    setCustomSpeedScreen: setCustomSpeedScreen,
    submitDirectiveScreen: submitDirectiveScreen,
    addStoryRule: addStoryRule,
    updateStoryRulesList: updateStoryRulesList,
    removeStoryRule: removeStoryRule,
    getActiveRules: getActiveRules,
    updateGenerationMode: updateGenerationMode,
    updateAdminProgressInfo: updateAdminProgressInfo,
    resetStory: resetStory,
    quickResetStory: quickResetStory,
    togglePause: togglePause,
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
    window.updateSpeedDisplay = updateSpeedDisplay;
    window.highlightActiveSpeed = highlightActiveSpeed;
    window.toggleDirectorMode = toggleDirectorMode;
    window.showDirectorModeToggle = showDirectorModeToggle;
    window.hideDirectorModeToggle = hideDirectorModeToggle;
    window.toggleDirectorModeFromUser = toggleDirectorModeFromUser;
    window.toggleSection = toggleSection;
    window.toggleStatusScreen = toggleStatusScreen;
    window.updateStatusScreen = updateStatusScreen;
    window.setCustomSpeedScreen = setCustomSpeedScreen;
    window.submitDirectiveScreen = submitDirectiveScreen;
    window.addStoryRule = addStoryRule;
    window.updateStoryRulesList = updateStoryRulesList;
    window.removeStoryRule = removeStoryRule;
    window.getActiveRules = getActiveRules;
    window.updateGenerationMode = updateGenerationMode;
    window.updateAdminProgressInfo = updateAdminProgressInfo;
    window.resetStory = resetStory;
    window.quickResetStory = quickResetStory;
    window.togglePause = togglePause;
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
