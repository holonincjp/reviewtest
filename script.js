// サンプルPRデータ
const samplePRs = [
    {
        id: 1,
        title: "ユーザー認証機能の追加",
        author: "田中太郎",
        status: "pending",
        createdAt: "2025-01-15",
        description: "JWTを使用したユーザー認証システムを実装"
    },
    {
        id: 2,
        title: "レスポンシブデザインの改善",
        author: "佐藤花子",
        status: "approved",
        createdAt: "2025-01-14",
        description: "モバイルデバイスでの表示を最適化"
    },
    {
        id: 3,
        title: "パフォーマンス最適化",
        author: "鈴木一郎",
        status: "rejected",
        createdAt: "2025-01-13",
        description: "データベースクエリの最適化とキャッシュの実装"
    },
    {
        id: 4,
        title: "テストカバレッジの向上",
        author: "高橋美咲",
        status: "pending",
        createdAt: "2025-01-12",
        description: "ユニットテストとE2Eテストの追加"
    },
    {
        id: 5,
        title: "セキュリティ強化",
        author: "伊藤健太",
        status: "approved",
        createdAt: "2025-01-11",
        description: "SQLインジェクション対策とXSS対策の実装"
    }
];

// 現在のセクションを管理
let currentSection = 'dashboard';

// 選択されたラベルとレビュアー
let selectedLabels = [];
let selectedReviewers = [];

// 通知システム
let notifications = [];
let notificationInterval = null;
let autoRefreshInterval = null;

// DOM要素の取得
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const prTableBody = document.getElementById('pr-table-body');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const reviewForm = document.getElementById('review-form-element');
const ratingStars = document.querySelectorAll('.star');
const createPRForm = document.getElementById('create-pr-form');
const labelTags = document.querySelectorAll('.label-tag');
const reviewerTags = document.querySelectorAll('.reviewer-tag');
const priorityFilter = document.getElementById('priority-filter');
const typeFilter = document.getElementById('type-filter');
const advancedSearchBtn = document.getElementById('advanced-search-btn');
const advancedSearchModal = document.getElementById('advanced-search-modal');
const advancedSearchForm = document.getElementById('advanced-search-form');
const notificationCenter = document.getElementById('notification-center');
const notificationList = document.getElementById('notification-list');
const clearAllNotificationsBtn = document.getElementById('clear-all-notifications');

// ナビゲーション機能
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        showSection(targetSection);
        
        // アクティブなナビリンクを更新
        navLinks.forEach(navLink => navLink.classList.remove('active'));
        link.classList.add('active');
    });
});

// セクション表示関数
function showSection(sectionName) {
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // セクション固有の初期化
        if (sectionName === 'pr-list') {
            renderPRTable(samplePRs);
        } else if (sectionName === 'create-pr') {
            initializeCreatePRForm();
        }
    }
}

// PRテーブルの表示
function renderPRTable(prs) {
    if (!prTableBody) return;
    
    prTableBody.innerHTML = '';
    
    prs.forEach(pr => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${pr.id}</td>
            <td>
                <strong>${pr.title}</strong>
                <br><small>${pr.description}</small>
            </td>
            <td>${pr.author}</td>
            <td><span class="status-badge status-${pr.status}">${getStatusText(pr.status)}</span></td>
            <td>${pr.createdAt}</td>
            <td>
                <button class="btn btn-primary" onclick="reviewPR(${pr.id})">レビュー</button>
                <button class="btn btn-secondary" onclick="viewPR(${pr.id})">詳細</button>
            </td>
        `;
        prTableBody.appendChild(row);
    });
}

// ステータステキストの取得
function getStatusText(status) {
    const statusMap = {
        'pending': 'レビュー待ち',
        'approved': '承認済み',
        'rejected': '却下'
    };
    return statusMap[status] || status;
}

// フィルタリング機能
if (statusFilter) {
    statusFilter.addEventListener('change', filterPRs);
}

if (priorityFilter) {
    priorityFilter.addEventListener('change', filterPRs);
}

if (typeFilter) {
    typeFilter.addEventListener('change', filterPRs);
}

if (searchInput) {
    searchInput.addEventListener('input', filterPRs);
}

// 高度な検索
if (advancedSearchBtn) {
    advancedSearchBtn.addEventListener('click', openAdvancedSearch);
}

if (advancedSearchForm) {
    advancedSearchForm.addEventListener('submit', handleAdvancedSearch);
}

function filterPRs() {
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    const typeValue = typeFilter.value;
    const searchValue = searchInput.value.toLowerCase();
    
    let filteredPRs = samplePRs;
    
    // ステータスでフィルタリング
    if (statusValue && statusValue !== 'all') {
        filteredPRs = filteredPRs.filter(pr => pr.status === statusValue);
    }
    
    // 優先度でフィルタリング
    if (priorityValue && priorityValue !== 'all') {
        filteredPRs = filteredPRs.filter(pr => pr.priority === priorityValue);
    }
    
    // タイプでフィルタリング
    if (typeValue && typeValue !== 'all') {
        filteredPRs = filteredPRs.filter(pr => pr.type === typeValue);
    }
    
    // 検索でフィルタリング
    if (searchValue) {
        filteredPRs = filteredPRs.filter(pr => 
            pr.title.toLowerCase().includes(searchValue) ||
            pr.description.toLowerCase().includes(searchValue) ||
            pr.author.toLowerCase().includes(searchValue)
        );
    }
    
    renderPRTable(filteredPRs);
}

// レビュー機能
function reviewPR(prId) {
    showSection('review-form');
    
    // ナビリンクのアクティブ状態を更新
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('[data-section="review-form"]').classList.add('active');
    
    // PR番号を自動入力
    const prIdInput = document.getElementById('pr-id');
    if (prIdInput) {
        prIdInput.value = prId;
    }
}

function viewPR(prId) {
    const pr = samplePRs.find(p => p.id === prId);
    if (pr) {
        alert(`PR #${pr.id}: ${pr.title}\n作成者: ${pr.author}\nステータス: ${getStatusText(pr.status)}\n説明: ${pr.description}`);
    }
}

// レビューフォームの処理
if (reviewForm) {
    reviewForm.addEventListener('submit', handleReviewSubmit);
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(reviewForm);
    const reviewData = {
        prId: document.getElementById('pr-id').value,
        reviewerName: document.getElementById('reviewer-name').value,
        comment: document.getElementById('review-comment').value,
        status: document.getElementById('review-status').value,
        score: getSelectedRating()
    };
    
    // バリデーション
    if (!reviewData.status) {
        alert('レビュー結果を選択してください。');
        return;
    }
    
    if (reviewData.score === 0) {
        alert('評価スコアを選択してください。');
        return;
    }
    
    // レビューデータの処理（実際のアプリではAPIに送信）
    console.log('レビューデータ:', reviewData);
    
    // 成功メッセージ
    alert('レビューが正常に送信されました！');
    
    // フォームをリセット
    reviewForm.reset();
    resetRating();
    
    // ダッシュボードに戻る
    showSection('dashboard');
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('[data-section="dashboard"]').classList.add('active');
}

// 評価スコアの処理
let selectedRating = 0;

ratingStars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        setRating(rating);
    });
    
    star.addEventListener('mouseenter', () => {
        const rating = parseInt(star.getAttribute('data-rating'));
        highlightStars(rating);
    });
    
    star.addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
    });
    
    // キーボードアクセシビリティの追加
    star.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const rating = parseInt(star.getAttribute('data-rating'));
            setRating(rating);
        }
    });
});

function setRating(rating) {
    selectedRating = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    ratingStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function getSelectedRating() {
    return selectedRating;
}

function resetRating() {
    selectedRating = 0;
    highlightStars(0);
}

// ダッシュボードの統計を更新
function updateDashboardStats() {
    const pendingCount = samplePRs.filter(pr => pr.status === 'pending').length;
    const approvedCount = samplePRs.filter(pr => pr.status === 'approved').length;
    const rejectedCount = samplePRs.filter(pr => pr.status === 'rejected').length;
    
    // 統計カードの更新
    const pendingElement = document.querySelector('.card:nth-child(1) .number');
    const completedElement = document.querySelector('.card:nth-child(2) .number');
    
    if (pendingElement) pendingElement.textContent = pendingCount;
    if (completedElement) completedElement.textContent = approvedCount + rejectedCount;
}

// PR作成フォームの初期化
function initializeCreatePRForm() {
    // ラベルタグのクリックイベント
    labelTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const label = tag.getAttribute('data-label');
            if (selectedLabels.includes(label)) {
                selectedLabels = selectedLabels.filter(l => l !== label);
                tag.classList.remove('selected');
            } else {
                selectedLabels.push(label);
                tag.classList.add('selected');
            }
        });
    });

    // レビュアータグのクリックイベント
    reviewerTags.forEach(tag => {
        tag.addEventListener('click', () => {
            const reviewer = tag.getAttribute('data-reviewer');
            if (selectedReviewers.includes(reviewer)) {
                selectedReviewers = selectedReviewers.filter(r => r !== reviewer);
                tag.classList.remove('selected');
            } else {
                selectedReviewers.push(reviewer);
                tag.classList.add('selected');
            }
        });
    });

    // ファイルアップロードの処理
    const fileInput = document.getElementById('pr-files');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
}

// ファイルアップロード処理
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        showNotification(`ファイルが選択されました: ${fileNames}`, 'success');
    }
}

// PR作成フォームの送信処理
if (createPRForm) {
    createPRForm.addEventListener('submit', handleCreatePR);
}

function handleCreatePR(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('pr-title').value,
        description: document.getElementById('pr-description').value,
        author: document.getElementById('pr-author').value,
        branch: document.getElementById('pr-branch').value,
        type: document.getElementById('pr-type').value,
        priority: document.getElementById('pr-priority').value,
        labels: selectedLabels,
        reviewers: selectedReviewers
    };
    
    // バリデーション
    if (!formData.title || !formData.description || !formData.author || !formData.branch) {
        showNotification('必須項目を入力してください。', 'error');
        return;
    }
    
    if (selectedLabels.length === 0) {
        showNotification('少なくとも1つのラベルを選択してください。', 'error');
        return;
    }
    
    if (selectedReviewers.length === 0) {
        showNotification('少なくとも1人のレビュアーを選択してください。', 'error');
        return;
    }
    
    // 新しいPRを作成
    const newPR = {
        id: samplePRs.length + 1,
        title: formData.title,
        author: formData.author,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        description: formData.description,
        branch: formData.branch,
        type: formData.type,
        priority: formData.priority,
        labels: formData.labels,
        reviewers: formData.reviewers
    };
    
    // PRリストに追加
    samplePRs.unshift(newPR);
    
    // 成功メッセージ
    showNotification('PRが正常に作成されました！', 'success');
    
    // フォームをリセット
    createPRForm.reset();
    selectedLabels = [];
    selectedReviewers = [];
    
    // ラベルとレビュアーの選択状態をリセット
    labelTags.forEach(tag => tag.classList.remove('selected'));
    reviewerTags.forEach(tag => tag.classList.remove('selected'));
    
    // ダッシュボードに戻る
    showSection('dashboard');
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    document.querySelector('[data-section="dashboard"]').classList.add('active');
    
    // ダッシュボードの統計を更新
    updateDashboardStats();
}

// 下書き保存機能
function saveAsDraft() {
    const formData = {
        title: document.getElementById('pr-title').value,
        description: document.getElementById('pr-description').value,
        author: document.getElementById('pr-author').value,
        branch: document.getElementById('pr-branch').value,
        type: document.getElementById('pr-type').value,
        priority: document.getElementById('pr-priority').value,
        labels: selectedLabels,
        reviewers: selectedReviewers
    };
    
    // ローカルストレージに保存
    localStorage.setItem('prDraft', JSON.stringify(formData));
    showNotification('下書きが保存されました！', 'info');
}

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    // ダッシュボードの統計を更新
    updateDashboardStats();
    
    // デフォルトでダッシュボードを表示
    showSection('dashboard');
    
    // 設定の復元
    loadSettings();
    
    // 通知の復元
    loadNotifications();
    
    // 下書きがあれば復元
    const draft = localStorage.getItem('prDraft');
    if (draft) {
        try {
            const draftData = JSON.parse(draft);
            // 下書きデータをフォームに復元
            if (draftData.title) document.getElementById('pr-title').value = draftData.title;
            if (draftData.description) document.getElementById('pr-description').value = draftData.description;
            if (draftData.author) document.getElementById('pr-author').value = draftData.author;
            if (draftData.branch) document.getElementById('pr-branch').value = draftData.branch;
            if (draftData.type) document.getElementById('pr-type').value = draftData.type;
            if (draftData.priority) document.getElementById('pr-priority').value = draftData.priority;
            
            // ラベルとレビュアーの選択状態を復元
            selectedLabels = draftData.labels || [];
            selectedReviewers = draftData.reviewers || [];
            
            labelTags.forEach(tag => {
                const label = tag.getAttribute('data-label');
                if (selectedLabels.includes(label)) {
                    tag.classList.add('selected');
                }
            });
            
            reviewerTags.forEach(tag => {
                const reviewer = tag.getAttribute('data-reviewer');
                if (selectedReviewers.includes(reviewer)) {
                    tag.classList.add('selected');
                }
            });
            
            showNotification('下書きが復元されました！', 'info');
        } catch (e) {
            console.error('下書きの復元に失敗しました:', e);
        }
    }
    
    // エラーハンドリングの追加
    window.addEventListener('error', (e) => {
        console.error('JavaScriptエラーが発生しました:', e.error);
        showNotification('エラーが発生しました。コンソールを確認してください。', 'error');
    });
    
    // 未処理のPromise拒否のハンドリング
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未処理のPromise拒否:', e.reason);
        showNotification('予期しないエラーが発生しました。', 'error');
    });
    
    // 通知システムの初期化
    initNotificationSystem();
    
    // 自動更新の開始
    startAutoRefresh();
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('dashboard');
                updateActiveNav('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('pr-list');
                updateActiveNav('pr-list');
                break;
            case '3':
                e.preventDefault();
                showSection('create-pr');
                updateActiveNav('create-pr');
                break;
            case '4':
                e.preventDefault();
                showSection('review-form');
                updateActiveNav('review-form');
                break;
        }
    }
});

function updateActiveNav(sectionName) {
    navLinks.forEach(navLink => navLink.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

// 通知機能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // スタイルを追加
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // タイプ別の色
    const colors = {
        'info': '#667eea',
        'success': '#28a745',
        'warning': '#ffc107',
        'error': '#dc3545'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // アクセシビリティの改善
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// 新しい機能の関数群
function openAdvancedSearch() {
    if (advancedSearchModal) {
        advancedSearchModal.style.display = 'block';
    }
}

function closeAdvancedSearch() {
    if (advancedSearchModal) {
        advancedSearchModal.style.display = 'none';
    }
}

function handleAdvancedSearch(e) {
    e.preventDefault();
    
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const reviewerFilter = document.getElementById('reviewer-filter');
    const labelFilter = document.getElementById('label-filter');
    
    let filteredPRs = samplePRs;
    
    // 日付範囲でフィルタリング
    if (dateFrom) {
        filteredPRs = filteredPRs.filter(pr => pr.createdAt >= dateFrom);
    }
    if (dateTo) {
        filteredPRs = filteredPRs.filter(pr => pr.createdAt <= dateTo);
    }
    
    // レビュアーでフィルタリング
    const selectedReviewers = Array.from(reviewerFilter.selectedOptions).map(option => option.value);
    if (selectedReviewers.length > 0) {
        filteredPRs = filteredPRs.filter(pr => 
            pr.reviewers && pr.reviewers.some(reviewer => selectedReviewers.includes(reviewer))
        );
    }
    
    // ラベルでフィルタリング
    const selectedLabels = Array.from(labelFilter.selectedOptions).map(option => option.value);
    if (selectedLabels.length > 0) {
        filteredPRs = filteredPRs.filter(pr => 
            pr.labels && pr.labels.some(label => selectedLabels.includes(label))
        );
    }
    
    renderPRTable(filteredPRs);
    closeAdvancedSearch();
    showNotification(`高度な検索で${filteredPRs.length}件のPRが見つかりました`, 'info');
}

// 通知システム
function initNotificationSystem() {
    // 通知センターの表示/非表示
    if (clearAllNotificationsBtn) {
        clearAllNotificationsBtn.addEventListener('click', clearAllNotifications);
    }
    
    // 通知間隔の設定
    const interval = localStorage.getItem('notificationInterval') || 15;
    startNotificationInterval(interval * 60 * 1000); // 分をミリ秒に変換
}

function addNotification(title, message, type = 'info') {
    const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.unshift(notification);
    
    // 最大50件まで保存
    if (notifications.length > 50) {
        notifications.pop();
    }
    
    // ローカルストレージに保存
    saveNotifications();
    
    // 通知センターに表示
    updateNotificationCenter();
    
    // ブラウザ通知
    if (localStorage.getItem('browserNotifications') === 'true') {
        showBrowserNotification(title, message);
    }
}

function updateNotificationCenter() {
    if (!notificationList) return;
    
    notificationList.innerHTML = notifications.map(notification => `
        <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
             onclick="markNotificationAsRead(${notification.id})">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            <div class="notification-time">${formatTime(notification.timestamp)}</div>
        </div>
    `).join('');
}

function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        saveNotifications();
        updateNotificationCenter();
    }
}

function clearAllNotifications() {
    notifications = [];
    saveNotifications();
    updateNotificationCenter();
    showNotification('すべての通知がクリアされました', 'info');
}

function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function loadNotifications() {
    const saved = localStorage.getItem('notifications');
    if (saved) {
        try {
            notifications = JSON.parse(saved);
        } catch (e) {
            console.error('通知の読み込みに失敗しました:', e);
        }
    }
}

function startNotificationInterval(interval) {
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    
    notificationInterval = setInterval(() => {
        // 定期的な通知チェック
        checkForNotifications();
    }, interval);
}

function checkForNotifications() {
    // レビュー待ちのPRがあるかチェック
    const pendingPRs = samplePRs.filter(pr => pr.status === 'pending');
    if (pendingPRs.length > 0) {
        addNotification(
            'レビュー待ちのPRがあります',
            `${pendingPRs.length}件のPRがレビュー待ちです`,
            'warning'
        );
    }
}

function showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification(title, { body: message });
            }
        });
    }
}

// 設定管理
function loadSettings() {
    // 通知設定
    const emailNotifications = document.getElementById('email-notifications');
    const browserNotifications = document.getElementById('browser-notifications');
    const notificationInterval = document.getElementById('notification-interval');
    const itemsPerPage = document.getElementById('items-per-page');
    const autoRefreshInterval = document.getElementById('auto-refresh-interval');
    
    if (emailNotifications) {
        emailNotifications.checked = localStorage.getItem('emailNotifications') !== 'false';
    }
    if (browserNotifications) {
        browserNotifications.checked = localStorage.getItem('browserNotifications') !== 'false';
    }
    if (notificationInterval) {
        notificationInterval.value = localStorage.getItem('notificationInterval') || '15';
    }
    if (itemsPerPage) {
        itemsPerPage.value = localStorage.getItem('itemsPerPage') || '25';
    }
    if (autoRefreshInterval) {
        autoRefreshInterval.value = localStorage.getItem('autoRefreshInterval') || '60';
    }
    
    // 設定変更のイベントリスナー
    if (emailNotifications) {
        emailNotifications.addEventListener('change', saveSettings);
    }
    if (browserNotifications) {
        browserNotifications.addEventListener('change', saveSettings);
    }
    if (notificationInterval) {
        notificationInterval.addEventListener('change', saveSettings);
    }
    if (itemsPerPage) {
        itemsPerPage.addEventListener('change', saveSettings);
    }
    if (autoRefreshInterval) {
        autoRefreshInterval.addEventListener('change', saveSettings);
    }
}

function saveSettings() {
    const emailNotifications = document.getElementById('email-notifications');
    const browserNotifications = document.getElementById('browser-notifications');
    const notificationInterval = document.getElementById('notification-interval');
    const itemsPerPage = document.getElementById('items-per-page');
    const autoRefreshInterval = document.getElementById('auto-refresh-interval');
    
    if (emailNotifications) {
        localStorage.setItem('emailNotifications', emailNotifications.checked);
    }
    if (browserNotifications) {
        localStorage.setItem('browserNotifications', browserNotifications.checked);
    }
    if (notificationInterval) {
        localStorage.setItem('notificationInterval', notificationInterval.value);
        startNotificationInterval(notificationInterval.value * 60 * 1000);
    }
    if (itemsPerPage) {
        localStorage.setItem('itemsPerPage', itemsPerPage.value);
    }
    if (autoRefreshInterval) {
        localStorage.setItem('autoRefreshInterval', autoRefreshInterval.value);
        startAutoRefresh();
    }
}

// 自動更新
function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    const interval = localStorage.getItem('autoRefreshInterval') || 60;
    if (interval > 0) {
        autoRefreshInterval = setInterval(() => {
            updateDashboardStats();
            // 現在のセクションがPR一覧の場合、テーブルも更新
            if (currentSection === 'pr-list') {
                renderPRTable(samplePRs);
            }
        }, interval * 1000);
    }
}

// ユーティリティ関数
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分未満
        return '今';
    } else if (diff < 3600000) { // 1時間未満
        return `${Math.floor(diff / 60000)}分前`;
    } else if (diff < 86400000) { // 1日未満
        return `${Math.floor(diff / 3600000)}時間前`;
    } else {
        return date.toLocaleDateString('ja-JP');
    }
}

// データエクスポート・インポート
function exportAllData() {
    const data = {
        prs: samplePRs,
        notifications: notifications,
        settings: {
            emailNotifications: localStorage.getItem('emailNotifications'),
            browserNotifications: localStorage.getItem('browserNotifications'),
            notificationInterval: localStorage.getItem('notificationInterval'),
            itemsPerPage: localStorage.getItem('itemsPerPage'),
            autoRefreshInterval: localStorage.getItem('autoRefreshInterval')
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pr-review-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('全データがエクスポートされました', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.prs) {
                        samplePRs.length = 0;
                        samplePRs.push(...data.prs);
                    }
                    if (data.notifications) {
                        notifications.length = 0;
                        notifications.push(...data.notifications);
                    }
                    if (data.settings) {
                        Object.entries(data.settings).forEach(([key, value]) => {
                            if (value !== null) {
                                localStorage.setItem(key, value);
                            }
                        });
                    }
                    
                    updateDashboardStats();
                    if (currentSection === 'pr-list') {
                        renderPRTable(samplePRs);
                    }
                    updateNotificationCenter();
                    loadSettings();
                    
                    showNotification('データがインポートされました', 'success');
                } catch (error) {
                    showNotification('データのインポートに失敗しました', 'error');
                    console.error('インポートエラー:', error);
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearAllData() {
    if (confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
        localStorage.clear();
        samplePRs.length = 0;
        notifications.length = 0;
        
        updateDashboardStats();
        if (currentSection === 'pr-list') {
            renderPRTable(samplePRs);
        }
        updateNotificationCenter();
        
        showNotification('すべてのデータがクリアされました', 'info');
    }
}

// 設定画面のイベントリスナー設定
document.addEventListener('DOMContentLoaded', () => {
    // データ管理ボタンのイベントリスナー
    const exportAllBtn = document.getElementById('export-all-btn');
    const importBtn = document.getElementById('import-btn');
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllData);
    }
    if (importBtn) {
        importBtn.addEventListener('click', importData);
    }
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllData);
    }
});
