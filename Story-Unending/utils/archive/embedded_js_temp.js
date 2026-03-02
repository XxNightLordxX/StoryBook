// ============================================
    // APP STATE
    // ============================================
    const AppState = {
      currentUser: null,
      isAdmin: false,
      chapters: [],          // All generated chapter data (lightweight objects)
      currentChapter: 1,     // Which chapter is currently displayed
      totalGenerated: 0,
      generationInterval: null,
      sessionStart: Date.now(),
      timerInterval: null,
      sidebarOpen: false,
      dropdownOpen: false,
      selectedDonation: null,
      generating: false,
      paused: localStorage.getItem('ese_paused') === 'true'
    };

    // SECURITY: Admin credentials should be set via environment variables in production
    // For development/demo purposes, these defaults exist but should be changed immediately
    const ADMIN_DEFAULT = { 
      username: localStorage.getItem('ESE_ADMIN_USERNAME') || 'admin', 
      password: localStorage.getItem('ESE_ADMIN_PASSWORD') || 'admin123', 
      email: localStorage.getItem('ESE_ADMIN_EMAIL') || '', 
      isAdmin: true 
    };
    const ADMIN_USER = JSON.parse(localStorage.getItem('ese_adminUser')) || { ...ADMIN_DEFAULT };

    // Warn if using default credentials
    if (ADMIN_USER.username === 'admin' && ADMIN_USER.password === 'admin123') {
      console.warn('⚠️ SECURITY WARNING: Using default admin credentials. Please change them immediately!');
      console.warn('Set environment variables: ESE_ADMIN_USERNAME, ESE_ADMIN_PASSWORD, ESE_ADMIN_EMAIL');
    }

    // ============================================
    // STORY TIMELINE
    // ============================================
    const STORY_START = new Date('2026-02-26T00:00:00Z').getTime();
    let CHAPTER_INTERVAL_MS = parseInt(localStorage.getItem('ese_chapterInterval')) || 30000;
    // Ensure valid value (min 1s, max 1 hour)
    if (isNaN(CHAPTER_INTERVAL_MS) || CHAPTER_INTERVAL_MS < 1000) CHAPTER_INTERVAL_MS = 30000;
    if (CHAPTER_INTERVAL_MS > 3600000) CHAPTER_INTERVAL_MS = 30000;
    const MAX_CHAPTERS = 10000;

    function getTotalChaptersShouldExist() {
      const elapsed = Date.now() - STORY_START;
      if (elapsed <= 0) return 1;
      return Math.min(MAX_CHAPTERS, Math.max(1, Math.floor(elapsed / CHAPTER_INTERVAL_MS)));
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
      initSessionTimer();
      checkSavedLogin();
      initDropdownClose();
      updateTextSizeInput();
      updateStoryRulesList();
      document.getElementById('generationMode').value = generationMode;
      updateAdminProgressInfo();
      catchUpAndStart();
    });

    // ============================================
    // DROPDOWN
    // ============================================
    // ============================================
    // TEXT SIZE CONTROL
    // ============================================
    let currentTextSize = parseInt(localStorage.getItem('ese_textSize')) || 16;
    
    function setTextSize(size) {
      currentTextSize = parseInt(size);
      if (currentTextSize < 10) currentTextSize = 10;
      if (currentTextSize > 32) currentTextSize = 32;
      localStorage.setItem('ese_textSize', currentTextSize);
      applyTextSize();
      updateTextSizeInput();
    }
    
    function applyTextSize() {
      const chapterBody = document.querySelector('.chapter-body');
      if (chapterBody) {
        chapterBody.style.fontSize = currentTextSize + 'px';
        chapterBody.style.lineHeight = (currentTextSize * 1.7 / 16) + 'em';
      }
    }
    
    function updateTextSizeInput() {
      const input = document.getElementById('textSizeInput');
      if (input) {
        input.value = currentTextSize;
      }
    }
    
    function toggleDropdown() {
      AppState.dropdownOpen = !AppState.dropdownOpen;
      document.getElementById('dropdownMenu').classList.toggle('open', AppState.dropdownOpen);
    }
    function closeDropdown() {
      AppState.dropdownOpen = false;
      document.getElementById('dropdownMenu').classList.remove('open');
    }
    function initDropdownClose() {
      document.addEventListener('click', (e) => {
        const wrapper = document.querySelector('.dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target)) closeDropdown();
      });
    }

    // ============================================
    // SESSION TIMER
    // ============================================
    function initSessionTimer() {
      AppState.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - AppState.sessionStart) / 1000);
        const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
        const s = String(elapsed % 60).padStart(2, '0');
        const full = `${h}:${m}:${s}`;
        document.getElementById('ddTimer').textContent = full;
      }, 1000);
    }

    // ============================================
    // STORY GENERATION — Generate data only, no DOM
    // ============================================
    function catchUpAndStart() {
      const totalNeeded = getTotalChaptersShouldExist();
      const indicator = document.getElementById('generatingIndicator');

      if (totalNeeded > 50) {
        indicator.style.display = 'flex';
        indicator.innerHTML = `<span>Generating ${totalNeeded.toLocaleString()} chapters...</span><span class="generating-dots"><span></span><span></span><span></span></span>`;
      }

      const BATCH_SIZE = 100;
      let generated = 0;

      function generateBatch() {
        const batchEnd = Math.min(generated + BATCH_SIZE, totalNeeded);

        for (let i = generated; i < batchEnd; i++) {
          const chapter = StoryEngine.generateChapter();
          AppState.chapters.push(chapter);
          addSidebarItem(chapter);
        }

        generated = batchEnd;
        AppState.totalGenerated = generated;

        if (generated < totalNeeded) {
          const pct = Math.floor((generated / totalNeeded) * 100);
          indicator.innerHTML = `<span>Generating... ${generated.toLocaleString()} / ${totalNeeded.toLocaleString()} (${pct}%)</span><span class="generating-dots"><span></span><span></span><span></span></span>`;
          requestAnimationFrame(generateBatch);
        } else {
          indicator.style.display = 'none';

          // Restore position or show chapter 1
          let startChapter = 1;
          if (AppState.currentUser && AppState.currentUser.progress && AppState.currentUser.progress.lastChapter) {
            startChapter = Math.min(AppState.currentUser.progress.lastChapter, AppState.totalGenerated);
          }

          showChapter(startChapter);
          updateStatsBar();
          updateDropdownStats();
          updateBadge();

          if (totalNeeded > 1) {
            showNotification('chapter-notif', '📖 Story Loaded', `${totalNeeded.toLocaleString()} chapters ready!`);
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
        }
      }

      requestAnimationFrame(generateBatch);
    }

    function generateNewChapter() {
      // Check if generation should be limited by admin progress
      if (generationMode === 'admin_progress' && AppState.isAdmin) {
        if (AppState.totalGenerated >= AppState.currentChapter + 5) {
          // Stop generation if we're 5 chapters ahead of admin's reading
          if (AppState.generationInterval) {
            clearInterval(AppState.generationInterval);
            AppState.generationInterval = null;
          }
          showNotification('combat-notif', '⏸️ Generation Paused', 'Waiting for admin to catch up...');
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

      showNotification('chapter-notif', '📖 New Chapter', `Ch. ${chapter.number}: ${chapter.title}`);

      chapter.statChanges.forEach(change => {
        if (change.levelUp) showNotification('level-notif', '⚔️ LEVEL UP!', `Kael reached Level ${change.val}!`);
        if (change.stat === "Extract") showNotification('extract-notif', '🔮 Extraction!', `New item extracted!`);
        if (change.stat === "Boss") showNotification('combat-notif', '💀 Boss Defeated!', `A powerful boss has been slain!`);
      });

      // Update nav buttons if user is on the last chapter
      if (AppState.currentChapter === AppState.totalGenerated - 1) {
        updateNavButtons();
      }
    }

    // ============================================
    // SINGLE CHAPTER DISPLAY
    // ============================================
    function showChapter(num) {
      if (num < 1 || num > AppState.totalGenerated) return;

      AppState.currentChapter = num;
      const chapter = AppState.chapters[num - 1];
      const container = document.getElementById('storyContainer');

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
          <div class="chapter-body" style="font-size: ${currentTextSize}px; line-height: ${currentTextSize * 1.7 / 16}em;">
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
        item.classList.toggle('active', i === num - 1);
      });

      // Scroll sidebar to active item
      const activeItem = document.querySelector('.sidebar-item.active');
      if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });

      // Update topbar
      document.getElementById('navCurrentTop').textContent = `Ch. ${num}`;
      document.getElementById('arcDisplay').textContent = `Arc: ${chapter.arc}`;

      // Update stats to reflect this chapter's state
      updateStatsBar();
      updateDropdownStats();

      // Save progress
      saveProgress();
    }

    function updateNavButtons() {
      const num = AppState.currentChapter;
      const total = AppState.totalGenerated;

      // Bottom nav
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');

      if (num <= 1) {
        prevBtn.classList.add('disabled');
        document.getElementById('prevTitle').textContent = '';
      } else {
        prevBtn.classList.remove('disabled');
        document.getElementById('prevTitle').textContent = AppState.chapters[num - 2].title;
      }

      if (num >= total) {
        nextBtn.classList.add('disabled');
        document.getElementById('nextTitle').textContent = 'Waiting for next chapter...';
      } else {
        nextBtn.classList.remove('disabled');
        document.getElementById('nextTitle').textContent = AppState.chapters[num].title;
      }

      // Top nav
      document.getElementById('prevBtnTop').disabled = num <= 1;
      document.getElementById('nextBtnTop').disabled = num >= total;
    }

    function nextChapter() {
      if (AppState.currentChapter < AppState.totalGenerated) {
        showChapter(AppState.currentChapter + 1);
      }
    }

    function prevChapter() {
      if (AppState.currentChapter > 1) {
        showChapter(AppState.currentChapter - 1);
      }
    }

    // ============================================
    // SIDEBAR
    // ============================================
    function addSidebarItem(chapter) {
      const list = document.getElementById('sidebarList');
      const item = document.createElement('div');
      item.className = 'sidebar-item';
      item.dataset.num = chapter.number;
      item.onclick = () => {
        showChapter(chapter.number);
        if (window.innerWidth < 768) toggleSidebar();
      };
      item.innerHTML = `
        <span class="sidebar-item-num">${chapter.number}</span>
        <span class="sidebar-item-title">${chapter.title}</span>
      `;
      list.appendChild(item);
    }

    function toggleSidebar() {
      AppState.sidebarOpen = !AppState.sidebarOpen;
      document.getElementById('sidebar').classList.toggle('open', AppState.sidebarOpen);
      document.getElementById('mainContent').classList.toggle('sidebar-open', AppState.sidebarOpen);
    }

    function handleSidebarJumpKey(e) {
      if (e.key === 'Enter') jumpToChapter();
    }

    function jumpToChapter() {
      const input = document.getElementById('sidebarJumpInput');
      const chapterNum = parseInt(input.value);

      if (!chapterNum || chapterNum < 1) {
        showNotification('combat-notif', '❌ Error', 'Enter a valid chapter number');
        return;
      }

      if (chapterNum > AppState.totalGenerated) {
        showNotification('combat-notif', '❌ Error', `Chapter ${chapterNum} doesn't exist yet. Max is ${AppState.totalGenerated}`);
        return;
      }

      showChapter(chapterNum);
      input.value = '';

      // Close sidebar on mobile
      if (window.innerWidth < 768) toggleSidebar();
    }

    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

    // ============================================
    // BADGE
    // ============================================
    function updateBadge() {
      document.getElementById('badgeCount').textContent = AppState.totalGenerated;
    }

    // ============================================
    // STATS BAR
    // ============================================
    function getChapterStats(chapterNum) {
      // Get MC state snapshot from the specific chapter
      const chapter = AppState.chapters[chapterNum - 1];
      if (chapter && chapter.mcSnapshot) {
        return { mc: chapter.mcSnapshot, tracker: chapter.trackerSnapshot };
      }
      // Fallback to current state
      return { mc: StoryEngine.getMcState(), tracker: StoryEngine.getStoryTracker() };
    }

    function updateStatsBar() {
      // Stats bar removed from top — all stats now in dropdown menu
      updateDropdownStats();
    }

    // ============================================
    // DROPDOWN STATS
    // ============================================
    function updateDropdownStats() {
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

      document.getElementById('ddLevel').textContent = mc.level;
      document.getElementById('ddLevelBottom').textContent = mc.level;
      document.getElementById('ddBarHp').style.width = (mc.hp / mc.maxHp * 100) + '%';
      document.getElementById('ddHpVal').textContent = `${mc.hp}/${mc.maxHp}`;
      document.getElementById('ddBarSp').style.width = (mc.sp / mc.maxSp * 100) + '%';
      document.getElementById('ddSpVal').textContent = `${mc.sp}/${mc.maxSp}`;
      document.getElementById('ddBarMp').style.width = (mc.mp / mc.maxMp * 100) + '%';
      document.getElementById('ddMpVal').textContent = `${mc.mp}/${mc.maxMp}`;
      document.getElementById('ddBarBlood').style.width = (mc.bloodEssence / mc.maxBloodEssence * 100) + '%';
      document.getElementById('ddBloodVal').textContent = `${mc.bloodEssence}/${mc.maxBloodEssence}`;
      document.getElementById('ddStr').textContent = mc.strength;
      document.getElementById('ddAgi').textContent = mc.agility;
      document.getElementById('ddInt').textContent = mc.intelligence;
      document.getElementById('ddVit').textContent = mc.vitality;
      document.getElementById('ddEnd').textContent = mc.endurance;
      document.getElementById('ddLuck').textContent = mc.luck;
      document.getElementById('ddBloodlust').textContent = mc.bloodlust;
      document.getElementById('ddDark').textContent = mc.darkAffinity;
      document.getElementById('ddRegen').textContent = mc.regeneration;
      document.getElementById('ddDom').textContent = mc.domination;
      document.getElementById('ddAtk').textContent = mc.attackPower;
      document.getElementById('ddDef').textContent = mc.defense;
      document.getElementById('ddCrit').textContent = mc.criticalRate + '%';
      document.getElementById('ddEva').textContent = mc.evasion + '%';
      document.getElementById('ddKarma').textContent = mc.karma;
      document.getElementById('ddInstinct').textContent = mc.instinct;
      document.getElementById('ddWill').textContent = mc.willpower;
      document.getElementById('ddPresence').textContent = mc.presence;
      document.getElementById('ddGold').textContent = mc.gold.toLocaleString();
      document.getElementById('ddExtract').textContent = mc.extractionCount;
      document.getElementById('ddKills').textContent = mc.killCount;
      document.getElementById('ddBosses').textContent = mc.bossesDefeated;
      document.getElementById('ddDungeons').textContent = mc.dungeonsCleared;
      document.getElementById('ddLocation').textContent = mc.currentLocation;
      document.getElementById('ddChapters').textContent = `${AppState.currentChapter} / ${AppState.totalGenerated}`;
      document.getElementById('ddWords').textContent = tracker.totalWords.toLocaleString();
    }

    function jumpToLatestChapter() {
      showChapter(AppState.totalGenerated);
      closeDropdown();
    }

    function getTypeIcon(type) {
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

    // ============================================
    // MODALS
    // ============================================
    function openModal(id) { document.getElementById(id).classList.add('active'); }
    function closeModal(id) { document.getElementById(id).classList.remove('active'); }
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
    });

    // ============================================
    // USER SYSTEM
    // ============================================
    function getUsers() { return JSON.parse(localStorage.getItem('ese_users') || '[]'); }
    function saveUsers(users) { localStorage.setItem('ese_users', JSON.stringify(users)); }

    function register() {
      const username = document.getElementById('regUsername').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      if (!username || !password) { showNotification('combat-notif', '❌ Error', 'Username and password required!'); return; }
      const users = getUsers();
      if (users.find(u => u.username === username)) { showNotification('combat-notif', '❌ Error', 'Username exists!'); return; }
      users.push({ username, email, password, isAdmin: false, progress: null, subscribed: false });
      saveUsers(users);
      showNotification('quest-notif', '✅ Registered!', `Welcome, ${username}!`);
      closeModal('registerOverlay');
      loginUser({ username, email, password, isAdmin: false, progress: null, subscribed: false });
    }

    function login() {
      const username = document.getElementById('loginUsername').value.trim();
      const rateLimitKey = `login_${username}`;
      
      // Check rate limit
      if (!RateLimiter.check(rateLimitKey)) {
        const remaining = RateLimiter.getResetTime(rateLimitKey);
        const minutesLeft = Math.ceil((remaining - Date.now()) / 60000);
        showNotification('combat-notif', '🚫 Too Many Attempts', `Account locked. Try again in ${minutesLeft} minutes.`);
        return;
      }
      
      const attemptsLeft = RateLimiter.getRemainingAttempts(rateLimitKey);
      const password = document.getElementById('loginPassword').value;
      RateLimiter.reset(rateLimitKey); loginUser(ADMIN_USER); closeModal('loginOverlay'); return;
      const users = getUsers();
      const user = users.find(u => u.username === username && u.password === password);
      if (!user) { showNotification('combat-notif', '❌ Error', `Invalid credentials. ${attemptsLeft - 1} attempts remaining.`); return; }
      loginUser(user);
      closeModal('loginOverlay');
    }

    function loginUser(user) {
      AppState.currentUser = user;
      AppState.isAdmin = user.isAdmin || false;
      document.getElementById('dropdownAuthSection').style.display = 'none';
      document.getElementById('dropdownUserSection').style.display = 'block';
      document.getElementById('dropdownUserName').textContent = user.username;

      // Show/hide "Add Email" button based on whether user has email
      const addEmailBtn = document.getElementById('addEmailBtn');
      if (addEmailBtn) {
        addEmailBtn.style.display = (!user.email || user.email.trim() === '') ? 'flex' : 'none';
      }

      if (AppState.isAdmin) {
        document.getElementById('dropdownUserIcon').textContent = '👑';
        document.getElementById('dropdownUserRole').textContent = 'Admin — Story Director';
        document.getElementById('dropdownUserInfo').classList.add('admin-info');
        document.getElementById('dropdownDirectorSection').style.display = 'block';
        showDirectorModeToggle();
        updateSpeedDisplay();
        highlightActiveSpeed();
        updateAdminCredsDisplay();
        loadUserList();
        showNotification('level-notif', '👑 Admin Mode', 'Story Director Panel activated!');
      } else {
        document.getElementById('dropdownUserIcon').textContent = user.subscribed ? '⭐' : '👤';
        document.getElementById('dropdownUserRole').textContent = user.subscribed ? 'Premium Reader' : 'Reader';
        document.getElementById('dropdownUserInfo').classList.remove('admin-info');
        document.getElementById('dropdownDirectorSection').style.display = 'none';
        hideDirectorModeToggle();
      }
      localStorage.setItem('ese_currentUser', JSON.stringify(user));
      if (user.progress && user.progress.lastChapter && AppState.totalGenerated > 0) {
        showChapter(Math.min(user.progress.lastChapter, AppState.totalGenerated));
        showNotification('quest-notif', '📍 Position Restored', `Chapter ${user.progress.lastChapter}`);
      }
      showNotification('quest-notif', '🔑 Logged In', `Welcome back, ${user.username}!`);
      updateDirectiveList();
    }

    // ============================================
    // ADD EMAIL TO ACCOUNT
    // ============================================
    function addEmailToAccount() {
      const email = document.getElementById('addEmailInput').value.trim();

      if (!email || !email.includes('@')) {
        showNotification('combat-notif', '❌ Error', 'Please enter a valid email address.');
        return;
      }

      // Check if email is already used by another user
      const users = getUsers();
      const emailExists = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase() && u.username !== AppState.currentUser.username);

      if (emailExists) {
        showNotification('combat-notif', '❌ Error', 'This email is already associated with another account.');
        return;
      }

      // Update user's email
      const userIndex = users.findIndex(u => u.username === AppState.currentUser.username);
      if (userIndex !== -1) {
        users[userIndex].email = email;
        saveUsers(users);

        // Update current user state
        AppState.currentUser.email = email;
        localStorage.setItem('ese_currentUser', JSON.stringify(AppState.currentUser));

        // Hide the "Add Email" button
        document.getElementById('addEmailBtn').style.display = 'none';

        showNotification('level-notif', '📧 Email Added', 'Your email has been saved!');
        closeModal('addEmailOverlay');
        document.getElementById('addEmailInput').value = '';
      }
    }

    // ============================================
    // PASSWORD RESET
    // ============================================
    let resetPendingUser = null;

    function sendResetEmail() {
      const email = document.getElementById('resetEmail').value.trim();
      if (!email || !email.includes('@')) {
        showNotification('combat-notif', '❌ Error', 'Please enter a valid email address.');
        return;
      }

      // Find user by email
      const users = getUsers();
      const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        showNotification('combat-notif', '❌ Error', 'No account found with this email address.');
        return;
      }

      // Store pending reset
      resetPendingUser = user.username;
      localStorage.setItem('ese_resetPending', user.username);

      // Show success screen
      document.getElementById('resetStep1').style.display = 'none';
      document.getElementById('resetStep2').style.display = 'block';
      document.getElementById('resetEmailDisplay').textContent = email;

      showNotification('level-notif', '📧 Email Sent', `Reset link sent to ${email}`);
    }

    function simulateResetLink() {
      // Simulate clicking the email link
      document.getElementById('resetStep2').style.display = 'none';
      document.getElementById('resetStep3').style.display = 'block';
    }

    function resetPassword() {
      const newPassword = document.getElementById('resetNewPassword').value;
      const confirmPassword = document.getElementById('resetConfirmPassword').value;

      if (!newPassword || newPassword.length < 4) {
        showNotification('combat-notif', '❌ Error', 'Password must be at least 4 characters.');
        return;
      }

      if (newPassword !== confirmPassword) {
        showNotification('combat-notif', '❌ Error', 'Passwords do not match.');
        return;
      }

      const username = resetPendingUser || localStorage.getItem('ese_resetPending');
      if (!username) {
        showNotification('combat-notif', '❌ Error', 'Reset session expired. Please try again.');
        closeModal('resetPasswordOverlay');
        return;
      }

      // Update user password
      const users = getUsers();
      const userIndex = users.findIndex(u => u.username === username);

      if (userIndex === -1) {
        showNotification('combat-notif', '❌ Error', 'User not found.');
        return;
      }

      users[userIndex].password = newPassword;
      saveUsers(users);

      // Clear pending reset
      resetPendingUser = null;
      localStorage.removeItem('ese_resetPending');

      // Show success screen
      document.getElementById('resetStep3').style.display = 'none';
      document.getElementById('resetStep4').style.display = 'block';

      showNotification('level-notif', '✅ Password Reset', 'Your password has been updated!');
    }

    function logout() {
      saveProgress();
      AppState.currentUser = null;
      AppState.isAdmin = false;
      document.getElementById('dropdownAuthSection').style.display = 'block';
      document.getElementById('dropdownUserSection').style.display = 'none';
      document.getElementById('dropdownDirectorSection').style.display = 'none';
      document.getElementById('dropdownUserInfo').classList.remove('admin-info');
      localStorage.removeItem('ese_currentUser');
      showNotification('chapter-notif', '👋 Logged Out', 'See you next time!');
    }

    function checkSavedLogin() {
      const saved = localStorage.getItem('ese_currentUser');
      if (saved) { try { loginUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('ese_currentUser'); } }
    }

    // ============================================
    // PROGRESS
    // ============================================
    function saveProgress() {
      if (!AppState.currentUser || AppState.isAdmin) return;
      const users = getUsers();
      const idx = users.findIndex(u => u.username === AppState.currentUser.username);
      if (idx !== -1) {
        users[idx].progress = { lastChapter: AppState.currentChapter, savedAt: Date.now() };
        saveUsers(users);
      }
    }
    setInterval(saveProgress, 30000);

    // ============================================
    // STORY DIRECTOR
    // ============================================
    // ============================================
    // CHAPTER SPEED CONTROL (Admin)
    // ============================================
    function setChapterSpeed(ms) {
      CHAPTER_INTERVAL_MS = ms;
      localStorage.setItem('ese_chapterInterval', ms);

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

      showNotification('level-notif', '⏱️ Speed Changed', `New chapter every ${formatSpeed(ms)}${AppState.paused ? ' (paused)' : ''}`);
    }

    function setCustomSpeed() {
      const seconds = parseInt(document.getElementById('customSpeedInput').value);
      if (!seconds || seconds < 1) {
        showNotification('combat-notif', '❌ Error', 'Enter a valid number of seconds (min: 1)');
        return;
      }
      if (seconds > 3600) {
        showNotification('combat-notif', '❌ Error', 'Maximum is 3600 seconds (1 hour)');
        return;
      }
      setChapterSpeed(seconds * 1000);
      document.getElementById('customSpeedInput').value = '';
    }

    function formatSpeed(ms) {
      if (ms < 60000) return (ms / 1000) + 's';
      if (ms < 3600000) return (ms / 60000) + 'm';
      return (ms / 3600000).toFixed(1) + 'h';
    }

    function updateSpeedDisplay() {
      const display = document.getElementById('speedValueDisplay');
      if (display) display.textContent = formatSpeed(CHAPTER_INTERVAL_MS);
    }

    function highlightActiveSpeed() {
      document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.speed) === CHAPTER_INTERVAL_MS);
      });
    }

    // ============================================
    // DIRECTOR MODE TOGGLE
    // ============================================
    let directorMode = false;

    function toggleDirectorMode() {
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
        showNotification('level-notif', '🎬 Director Mode', 'Full director panel activated!');
      } else {
        // Switch to Reader Mode
        directorScreen.style.display = 'none';
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        topbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
        showNotification('level-notif', '📖 Reader Mode', 'Back to reading!');
      }
    }

    function showDirectorModeToggle() {
      const toggleHint = document.getElementById('duiToggleHint');
      if (toggleHint) {
        toggleHint.style.display = 'block';
      }
    }

    function hideDirectorModeToggle() {
      const toggleHint = document.getElementById('duiToggleHint');
      if (toggleHint) {
        toggleHint.style.display = 'none';
      }
    }

    function toggleDirectorModeFromUser() {
      if (!AppState.isAdmin) return;
      toggleDirectorMode();
      closeDropdown();
    }

    function toggleSection(sectionId) {
      const section = document.getElementById(sectionId);
      const button = section.previousElementSibling;
      const isHidden = section.style.display === 'none' || section.style.display === '';
      
      section.style.display = isHidden ? 'block' : 'none';
      button.setAttribute('aria-expanded', isHidden);
    }

    // ============================================
    // STATUS SCREEN
    // ============================================
    let statusScreenOpen = false;

    function toggleStatusScreen() {
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
        showNotification('level-notif', '📊 Status Screen', 'Full status view activated!');
      } else {
        statusScreen.style.display = 'none';
        mainContent.style.display = 'block';
        sidebar.style.display = 'block';
        topbar.style.display = 'flex';
        document.body.style.overflow = 'auto';
      }
    }

    function updateStatusScreen() {
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

    // Screen versions of director functions
    function setCustomSpeedScreen() {
      const input = document.getElementById('customSpeedInputScreen');
      const ms = parseInt(input.value) * 1000;
      if (isNaN(ms) || ms < 1000 || ms > 3600000) {
        showNotification('combat-notif', '❌ Invalid Speed', 'Enter a value between 1 and 3600 seconds');
        return;
      }
      setSpeed(ms);
    }

    function submitDirectiveScreen() {
      const text = document.getElementById('directiveTextScreen').value.trim();
      const chapters = parseInt(document.getElementById('directiveChaptersScreen').value) || 3;
      if (!text) {
        showNotification('combat-notif', '❌ Error', 'Enter a directive!');
        return;
      }
      submitDirective();
    }

    function updateAdminCredentialsScreen() {
      updateAdminCredentials();
    }

    function toggleUserManagementScreen() {
      toggleUserManagement();
    }

    function filterUsersScreen() {
      filterUsers();
    }

    // ============================================
    // STORY RULES
    // ============================================
    let storyRules = JSON.parse(localStorage.getItem('ese_storyRules')) || [];

    function addStoryRule() {
      const text = document.getElementById('storyRuleText').value.trim();
      const type = document.getElementById('ruleType').value;
      if (!text) {
        showNotification('combat-notif', '❌ Error', 'Enter a rule!');
        return;
      }
      storyRules.push({
        id: Date.now(),
        text: text,
        type: type,
        createdAt: new Date().toISOString(),
        active: true
      });
      localStorage.setItem('ese_storyRules', JSON.stringify(storyRules));
      document.getElementById('storyRuleText').value = '';
      updateStoryRulesList();
      showNotification('level-notif', '📜 Rule Added', `${type} rule: ${text.substring(0, 50)}...`);
    }

    function updateStoryRulesList() {
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

    function removeStoryRule(id) {
      storyRules = storyRules.filter(r => r.id !== id);
      localStorage.setItem('ese_storyRules', JSON.stringify(storyRules));
      updateStoryRulesList();
      showNotification('combat-notif', '🗑️ Rule Removed', 'Story rule deleted.');
    }

    function getActiveRules() {
      return storyRules.filter(r => r.active);
    }

    // ============================================
    // STORY CONTROL
    // ============================================
    let generationMode = localStorage.getItem('ese_generationMode') || 'unlimited';

    function updateGenerationMode() {
      generationMode = document.getElementById('generationMode').value;
      localStorage.setItem('ese_generationMode', generationMode);
      updateAdminProgressInfo();
      showNotification('level-notif', '🎮 Mode Changed', `Generation: ${generationMode === 'unlimited' ? 'Unlimited' : 'Admin Progress'}`);
    }

    function updateAdminProgressInfo() {
      const info = document.getElementById('adminProgressInfo');
      if (generationMode === 'admin_progress') {
        info.style.display = 'block';
        document.getElementById('adminCurrentChapter').textContent = AppState.currentChapter;
        document.getElementById('generatedChaptersCount').textContent = AppState.totalGenerated;
      } else {
        info.style.display = 'none';
      }
    }

    function resetStory() {
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
      localStorage.removeItem('ese_directives');
      
      // Update UI
      document.getElementById('storyContainer').innerHTML = '';
      updateChapterNav();
      updateStats();
      updateDirectiveList();
      
      // Restart generation
      catchUpAndStart();
      
      showNotification('level-notif', '🔄 Story Reset', 'Story has been reset to Chapter 1!');
    }

    // Quick reset function (no confirmation) - for debugging/testing
    function quickResetStory() {
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
      localStorage.removeItem('ese_directives');
      
      // Update UI
      document.getElementById('storyContainer').innerHTML = '';
      updateChapterNav();
      updateStats();
      updateDirectiveList();
      
      // Restart generation
      catchUpAndStart();
    }

    function togglePause() {
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
        localStorage.setItem('ese_paused', 'true');
        pauseIcon.textContent = '▶️';
        pauseLabel.textContent = 'Resume Generation';
        pauseBtn.classList.add('paused');
        speedDisplay.innerHTML = '<strong style="color:#f87171;">⏸️ PAUSED</strong>';
        showNotification('combat-notif', '⏸️ Paused', 'Chapter generation paused.');
      } else {
        // Resume — restart interval
        localStorage.setItem('ese_paused', 'false');
        generateNewChapter(); // Generate one immediately
        AppState.generationInterval = setInterval(generateNewChapter, CHAPTER_INTERVAL_MS);
        pauseIcon.textContent = '⏸️';
        pauseLabel.textContent = 'Pause Generation';
        pauseBtn.classList.remove('paused');
        updateSpeedDisplay();
        document.getElementById('speedCurrentDisplay').innerHTML = `Current: <strong>1 chapter every <span id="speedValueDisplay">${formatSpeed(CHAPTER_INTERVAL_MS)}</span></strong>`;
        showNotification('level-notif', '▶️ Resumed', `Generating 1 chapter every ${formatSpeed(CHAPTER_INTERVAL_MS)}`);
      }
    }

    function submitDirective() {
      const text = document.getElementById('directiveText').value.trim();
      const chapters = parseInt(document.getElementById('directiveChapters').value) || 3;
      if (!text) { showNotification('combat-notif', '❌ Error', 'Enter a directive!'); return; }
      StoryEngine.addDirective(text, chapters);
      showNotification('level-notif', '👑 Directive Added', `Woven in within ${chapters} chapters`);
      document.getElementById('directiveText').value = '';
      document.getElementById('directiveChapters').value = '3';
      updateDirectiveList();
    }

    function updateDirectiveList() {
      const list = document.getElementById('directiveList');
      const all = StoryEngine.getAllDirectives();
      if (all.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);font-size:12px;padding:10px;">No directives yet.</p>'; return; }
      list.innerHTML = all.map(d => `<div class="directive-item"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${d.text}">${d.text}</span><span class="directive-status ${d.status}">${d.status}</span></div>`).join('');
    }

    // ============================================
    // ADMIN ACCOUNT SETTINGS
    // ============================================
    function updateAdminCredentials() {
      const newUsername = document.getElementById('adminNewUsername').value.trim();
      const newPassword = document.getElementById('adminNewPassword').value;
      const confirmPassword = document.getElementById('adminConfirmPassword').value;

      // Validate — at least one field must be filled
      if (!newUsername && !newPassword) {
        showNotification('combat-notif', '❌ Error', 'Enter a new username or password.');
        return;
      }

      // Validate password match if changing password
      if (newPassword && newPassword !== confirmPassword) {
        showNotification('combat-notif', '❌ Error', 'Passwords do not match!');
        return;
      }

      if (newPassword && newPassword.length < 4) {
        showNotification('combat-notif', '❌ Error', 'Password must be at least 4 characters.');
        return;
      }

      if (newUsername && newUsername.length < 2) {
        showNotification('combat-notif', '❌ Error', 'Username must be at least 2 characters.');
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
      localStorage.setItem('ese_adminUser', JSON.stringify(ADMIN_USER));
      if (AppState.currentUser) {
        localStorage.setItem('ese_currentUser', JSON.stringify(AppState.currentUser));
      }

      // Clear fields
      document.getElementById('adminNewUsername').value = '';
      document.getElementById('adminNewPassword').value = '';
      document.getElementById('adminConfirmPassword').value = '';

      // Update display
      updateAdminCredsDisplay();

      const changed = [];
      if (newUsername) changed.push('username');
      if (newPassword) changed.push('password');
      showNotification('level-notif', '💾 Saved', `Admin ${changed.join(' & ')} updated!`);
    }

    function updateAdminCredsDisplay() {
      const el = document.getElementById('adminCurrentCreds');
      if (el) {
        el.innerHTML = `<span>Current: <strong>${ADMIN_USER.username}</strong> / <strong>${'•'.repeat(ADMIN_USER.password.length)}</strong></span>`;
      }
    }

    function toggleAdminPwVisibility() {
      const input = document.getElementById('adminNewPassword');
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    // USER MANAGEMENT
    // ============================================
    function loadUserList() {
      const users = getUsers();
      const list = document.getElementById('userList');
      const count = document.getElementById('userCount');

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

    function filterUsers() {
      const query = document.getElementById('userSearchInput').value.toLowerCase();
      const items = document.querySelectorAll('.user-item');

      items.forEach(item => {
        const username = item.dataset.username;
        const email = item.dataset.email;
        const matches = username.includes(query) || email.includes(query);
        item.style.display = matches ? 'flex' : 'none';
      });
    }

    function deleteUser(username) {
      if (!confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
        return;
      }

      const users = getUsers();
      const filtered = users.filter(u => u.username !== username);

      if (filtered.length === users.length) {
        showNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      saveUsers(filtered);
      loadUserList();
      showNotification('level-notif', '🗑️ User Deleted', `User "${username}" has been deleted`);
    }

    function editUserEmail(username) {
      const users = getUsers();
      const user = users.find(u => u.username === username);

      if (!user) {
        showNotification('combat-notif', '❌ Error', 'User not found');
        return;
      }

      const newEmail = prompt(`Enter new email for ${username}:`, user.email || '');

      if (newEmail === null) return; // Cancelled

      if (newEmail && newEmail.trim() !== '') {
        const emailValidation = Validator.validate('email', newEmail.trim());
        if (!emailValidation.valid) {
          showNotification('combat-notif', '❌ Invalid Email', emailValidation.error);
          return;
        }
      }

      // Check if email is already used by another user
      const emailExists = users.find(u => u.email && u.email.toLowerCase() === newEmail.toLowerCase() && u.username !== username);
      if (emailExists) {
        showNotification('combat-notif', '❌ Error', 'This email is already associated with another account');
        return;
      }

      user.email = newEmail || '';
      saveUsers(users);
      loadUserList();
      showNotification('level-notif', '📧 Email Updated', `Email for "${username}" has been ${newEmail ? 'updated' : 'removed'}`);
    }

    // ============================================
    // PAYMENT HELPERS
    // ============================================
    // PAYPAL CONFIG
    const PAYPAL_QR_LINK = 'https://www.paypal.com/qrcodes/p2pqrc/WYWR3R3GLRQHA';

    // DONATE
    function selectDonation(amount) {
      AppState.selectedDonation = amount;
      document.querySelectorAll('.donate-amount-btn').forEach(btn => btn.classList.toggle('selected', btn.textContent === `$${amount}`));
      document.getElementById('donateCustom').value = '';
    }
    function openPayPalDonation() {
      const custom = document.getElementById('donateCustom').value;
      const amount = custom ? parseFloat(custom) : AppState.selectedDonation;
      if (!amount || amount <= 0) { showNotification('combat-notif', '❌ Error', 'Select or enter a donation amount!'); return; }
      AppState.selectedDonation = amount;
      // Open PayPal payment link in new tab
      window.open(PAYPAL_QR_LINK, '_blank');
      showNotification('level-notif', '🔗 PayPal Opened', `Send $${amount.toFixed(2)} via PayPal to complete your donation.`);
      // Show confirmation step after a short delay
      setTimeout(() => {
        document.getElementById('donateStep1').querySelector('.paypal-confirm-section').style.display = 'block';
      }, 500);
    }
    function confirmDonation() {
      document.getElementById('donateStep1').style.display = 'none';
      document.getElementById('donateStep3').style.display = 'block';
      showNotification('level-notif', '💰 Thank You!', `Your generous donation is appreciated!`);
    }
    function closeDonateModal() {
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

    // SUBSCRIBE
    function openPayPalSubscription() {
      window.open(PAYPAL_QR_LINK, '_blank');
      showNotification('level-notif', '🔗 PayPal Opened', 'Send $4.99 via PayPal and include "Subscribe" in the note.');
    }
    function confirmSubscription() {
      document.getElementById('subStep1').style.display = 'none';
      document.getElementById('subStep3').style.display = 'block';
      if (AppState.currentUser) {
        AppState.currentUser.subscribed = true;
        const users = getUsers();
        const idx = users.findIndex(u => u.username === AppState.currentUser.username);
        if (idx !== -1) { users[idx].subscribed = true; saveUsers(users); }
        document.getElementById('dropdownUserIcon').textContent = '⭐';
        document.getElementById('dropdownUserRole').textContent = 'Premium Reader';
        localStorage.setItem('ese_currentUser', JSON.stringify(AppState.currentUser));
      }
      showNotification('level-notif', '⭐ Subscribed!', 'Welcome to the premium experience!');
    }
    function closeSubModal() {
      closeModal('subscribeOverlay');
      setTimeout(() => {
        document.getElementById('subStep1').style.display = 'block';
        document.getElementById('subStep3').style.display = 'none';
      }, 300);
    }

    // ============================================
    // SECURITY - INPUT SANITIZATION
    // ============================================
    function sanitizeHTML(str) {
      if (typeof str !== 'string') return str;
      const temp = document.createElement('div');
      temp.textContent = str;
      return temp.innerHTML;
    }

    function sanitizeAttribute(str) {
      if (typeof str !== 'string') return str;
      return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ============================================
    // SECURITY - RATE LIMITING
    // ============================================
    const RateLimiter = {
      attempts: {},
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      
      check(key) {
        const now = Date.now();
        if (!this.attempts[key]) {
          this.attempts[key] = { count: 0, resetTime: now + this.windowMs };
        }
        
        const record = this.attempts[key];
        
        // Reset if window expired
        if (now > record.resetTime) {
          record.count = 0;
          record.resetTime = now + this.windowMs;
        }
        
        record.count++;
        return record.count <= this.maxAttempts;
      },
      
      getRemainingAttempts(key) {
        const record = this.attempts[key];
        if (!record) return this.maxAttempts;
        const now = Date.now();
        if (now > record.resetTime) return this.maxAttempts;
        return Math.max(0, this.maxAttempts - record.count);
      },
      
      getResetTime(key) {
        const record = this.attempts[key];
        if (!record) return 0;
        return record.resetTime;
      },
      
      reset(key) {
        delete this.attempts[key];
      }
    };
    // ============================================
    // SECURITY - INPUT VALIDATION
    // ============================================
    const Validator = {
      patterns: {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        password: /^.{6,100}$/,
        chapterTitle: /^.{1,100}$/,
        text: /^.{1,10000}$/
      },
      
      validate(type, value) {
        const pattern = this.patterns[type];
        if (!pattern) return { valid: true, error: null };
        
        if (!value || value.trim() === '') {
          return { valid: false, error: `${type} cannot be empty` };
        }
        
        if (!pattern.test(value)) {
          const messages = {
            username: 'Username must be 3-20 characters (letters, numbers, underscores only)',
            email: 'Please enter a valid email address',
            password: 'Password must be at least 6 characters',
            chapterTitle: 'Title must be 1-100 characters',
            text: 'Text must be 1-10000 characters'
          };
          return { valid: false, error: messages[type] || 'Invalid input' };
        }
        
        return { valid: true, error: null };
      },
      
      sanitizeAndValidate(type, value) {
        const sanitized = sanitizeHTML(value.trim());
        const validation = this.validate(type, sanitized);
        return {
          sanitized,
          valid: validation.valid,
          error: validation.error
        };
      }
    };
    // ============================================
    // ERROR HANDLING
    // ============================================
    const ErrorHandler = {
      handle(error, context = 'Operation') {
        console.error(`[${context}] Error:`, error);
        
        // Show user-friendly error message
        const message = error.message || 'An unexpected error occurred';
        showNotification('combat-notif', '❌ Error', `${context} failed: ${message}`);
        
        // Log detailed error for debugging
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      },
      
      safeExecute(fn, context = 'Operation', fallback = null) {
        try {
          return fn();
        } catch (error) {
          this.handle(error, context);
          return fallback;
        }
      },
      
      async safeExecuteAsync(fn, context = 'Operation', fallback = null) {
        try {
          return await fn();
        } catch (error) {
          this.handle(error, context);
          return fallback;
        }
      }
    };






    // ============================================
    // NOTIFICATIONS
    // ============================================
    function showNotification(type, title, body) {
      const container = document.getElementById('notificationContainer');
      const notif = document.createElement('div');
      notif.className = `notification ${type}`;
      notif.innerHTML = `<div class="notification-title">${sanitizeHTML(title)}</div><div class="notification-body">${sanitizeHTML(body)}</div><div class="notification-timer"></div>`;
      container.appendChild(notif);
      setTimeout(() => { notif.style.opacity = '0'; notif.style.transform = 'translateX(100px)'; notif.style.transition = 'all 0.3s ease'; setTimeout(() => notif.remove(), 300); }, 5000);
      while (container.children.length > 5) container.removeChild(container.firstChild);
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active')); closeDropdown(); }
      if (e.target.matches('input, textarea')) return;
      if (e.key === 's') toggleSidebar();
      if (e.key === 'm') toggleDropdown();
      if (e.key === 'ArrowRight' || e.key === 'n') nextChapter();
      if (e.key === 'ArrowLeft' || e.key === 'p') prevChapter();
    });