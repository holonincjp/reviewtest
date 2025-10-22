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

// 検索履歴
let searchHistory = [];
let isDarkMode = false;

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
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('pr-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.querySelector('.close');
const exportBtn = document.getElementById('export-btn');
const clearSearchBtn = document.getElementById('clear-search-btn');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.querySelector('.progress-fill');

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

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        filterPRs();
        updateSearchHistory(e.target.value);
    });
    
    // 検索履歴の表示
    searchInput.addEventListener('focus', showSearchHistory);
    searchInput.addEventListener('blur', () => {
        setTimeout(hideSearchHistory, 200);
    });
}

function filterPRs() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase();
    
    let filteredPRs = samplePRs;
    
    // ステータスでフィルタリング
    if (statusValue && statusValue !== 'all') {
        filteredPRs = filteredPRs.filter(pr => pr.status === statusValue);
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
        showPRModal(pr);
    }
}

// PR詳細モーダル表示
function showPRModal(pr) {
    modalContent.innerHTML = `
        <h2>PR #${pr.id}: ${pr.title}</h2>
        <div class="pr-details">
            <p><strong>作成者:</strong> ${pr.author}</p>
            <p><strong>ステータス:</strong> <span class="status-badge status-${pr.status}">${getStatusText(pr.status)}</span></p>
            <p><strong>作成日:</strong> ${pr.createdAt}</p>
            <p><strong>説明:</strong></p>
            <div class="pr-description">${pr.description}</div>
            ${pr.branch ? `<p><strong>ブランチ:</strong> ${pr.branch}</p>` : ''}
            ${pr.type ? `<p><strong>タイプ:</strong> ${pr.type}</p>` : ''}
            ${pr.priority ? `<p><strong>優先度:</strong> ${pr.priority}</p>` : ''}
            ${pr.labels && pr.labels.length > 0 ? `<p><strong>ラベル:</strong> ${pr.labels.join(', ')}</p>` : ''}
            ${pr.reviewers && pr.reviewers.length > 0 ? `<p><strong>レビュアー:</strong> ${pr.reviewers.join(', ')}</p>` : ''}
        </div>
        <div class="modal-actions">
            <button class="btn btn-primary" onclick="reviewPR(${pr.id}); closePRModal();">レビュー開始</button>
            <button class="btn btn-secondary" onclick="closePRModal()">閉じる</button>
        </div>
    `;
    modal.style.display = 'block';
}

// モーダルを閉じる
function closePRModal() {
    modal.style.display = 'none';
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
    // イベントリスナーのセットアップ
    setupEventListeners();
    
    // ダッシュボードの統計を更新
    updateDashboardStats();
    
    // デフォルトでダッシュボードを表示
    showSection('dashboard');
    
    // 進捗バーの初期化
    initProgressBar();
    
    // テーマの復元
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        toggleTheme();
    }
    
    // 検索履歴の復元
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
        try {
            searchHistory = JSON.parse(savedHistory);
        } catch (e) {
            console.error('検索履歴の復元に失敗しました:', e);
        }
    }
    
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
function setupEventListeners() {
    // テーマ切り替え
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // モーダル関連
    if (closeModal) {
        closeModal.addEventListener('click', closePRModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePRModal();
            }
        });
    }
    
    // エクスポート機能
    if (exportBtn) {
        exportBtn.addEventListener('click', exportPRData);
    }
    
    // 検索クリア
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
}

// テーマ切り替え
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // アイコンの更新
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (isDarkMode) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// データエクスポート
function exportPRData() {
    const currentPRs = getCurrentFilteredPRs();
    const csvContent = convertToCSV(currentPRs);
    downloadCSV(csvContent, 'pr-data.csv');
    showNotification('データがエクスポートされました！', 'success');
}

// 現在のフィルタリングされたPRを取得
function getCurrentFilteredPRs() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.toLowerCase();
    
    let filteredPRs = samplePRs;
    
    if (statusValue && statusValue !== 'all') {
        filteredPRs = filteredPRs.filter(pr => pr.status === statusValue);
    }
    
    if (searchValue) {
        filteredPRs = filteredPRs.filter(pr => 
            pr.title.toLowerCase().includes(searchValue) ||
            pr.description.toLowerCase().includes(searchValue) ||
            pr.author.toLowerCase().includes(searchValue)
        );
    }
    
    return filteredPRs;
}

// CSV変換
function convertToCSV(data) {
    const headers = ['ID', 'タイトル', '作成者', 'ステータス', '作成日', '説明'];
    const csvRows = [headers.join(',')];
    
    data.forEach(pr => {
        const row = [
            pr.id,
            `"${pr.title}"`,
            pr.author,
            getStatusText(pr.status),
            pr.createdAt,
            `"${pr.description}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// CSVダウンロード
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 検索クリア
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }
    if (statusFilter) {
        statusFilter.value = 'all';
    }
    filterPRs();
    showNotification('検索条件がクリアされました', 'info');
}

// 検索履歴の更新
function updateSearchHistory(query) {
    if (query.trim() && !searchHistory.includes(query)) {
        searchHistory.unshift(query);
        if (searchHistory.length > 10) {
            searchHistory.pop();
        }
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}

// 検索履歴の表示
function showSearchHistory() {
    if (searchHistory.length === 0) return;
    
    let historyContainer = document.querySelector('.search-history');
    if (!historyContainer) {
        historyContainer = document.createElement('div');
        historyContainer.className = 'search-history';
        searchInput.parentNode.appendChild(historyContainer);
    }
    
    historyContainer.innerHTML = searchHistory.map(query => 
        `<div class="search-history-item" onclick="selectSearchHistory('${query}')">${query}</div>`
    ).join('');
}

// 検索履歴の選択
function selectSearchHistory(query) {
    searchInput.value = query;
    filterPRs();
    hideSearchHistory();
}

// 検索履歴の非表示
function hideSearchHistory() {
    const historyContainer = document.querySelector('.search-history');
    if (historyContainer) {
        historyContainer.remove();
    }
}

// 進捗バーの初期化
function initProgressBar() {
    if (progressBar && progressFill) {
        // ページ読み込み時の進捗
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressFill.style.width = progress + '%';
        }, 100);
        
        // ページ読み込み完了時に100%にする
        window.addEventListener('load', () => {
            progressFill.style.width = '100%';
            setTimeout(() => {
                progressBar.style.opacity = '0';
                setTimeout(() => {
                    progressBar.style.display = 'none';
                }, 300);
            }, 500);
        });
    }
}
