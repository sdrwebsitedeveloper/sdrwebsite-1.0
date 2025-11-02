// pages/notices.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function rendernotices() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content">
            <h1 class="main-title">공지사항</h1>
            <input type="text" id="searchInput" placeholder="검색어를 입력하세요 (초성 검색 가능)">
            <button id="newPostButton" disabled>공지사항 작성</button>
            <div id="postsContainer"></div>
            <div id="paginationContainer"></div>
        </div>
    `;

    setupEventListeners();
    addnoticesStyles();
    loadPosts();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('newPostButton').addEventListener('click', () => {
        window.location.hash = 'newpost';
    });

    document.getElementById('searchInput').addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        loadPosts(searchTerm);
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            document.getElementById('newPostButton').disabled = false;
        } else {
            document.getElementById('newPostButton').disabled = true;
        }
    });
}

// 현재 페이지와 페이지당 게시물 수 설정
let currentPage = 1;
const postsPerPage = 10;
let filteredPosts = [];

// 게시물 표시 함수
function displayPosts(posts) {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    paginatedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.textContent = post.title;
        postElement.addEventListener('click', () => {
            window.location.hash = `postdetails?id=${post.id}`;
        });
        postsContainer.appendChild(postElement);
    });

    renderPaginationControls(posts.length);
}

// 페이지네이션 버튼 표시 함수
function renderPaginationControls(totalPosts) {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalPosts / postsPerPage);

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        const firstButton = document.createElement('button');
        firstButton.textContent = '<<';
        firstButton.addEventListener('click', () => {
            currentPage = 1;
            displayPosts(filteredPosts);
        });
        paginationContainer.appendChild(firstButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.addEventListener('click', () => {
            currentPage -= 1;
            displayPosts(filteredPosts);
        });
        paginationContainer.appendChild(prevButton);
    }

    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(maxButtons, totalPages);
    } else if (currentPage > totalPages - 3) {
        startPage = Math.max(totalPages - maxButtons + 1, 1);
    }

    if (startPage > 1) {
        paginationContainer.appendChild(createPageButton(1));
        if (startPage > 2) {
            paginationContainer.appendChild(createEllipsis());
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageButton(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.appendChild(createEllipsis());
        }
        paginationContainer.appendChild(createPageButton(totalPages));
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.addEventListener('click', () => {
            currentPage += 1;
            displayPosts(filteredPosts);
        });
        paginationContainer.appendChild(nextButton);

        const lastButton = document.createElement('button');
        lastButton.textContent = '>>';
        lastButton.addEventListener('click', () => {
            currentPage = totalPages;
            displayPosts(filteredPosts);
        });
        paginationContainer.appendChild(lastButton);
    }
}

// 페이지 번호 버튼 생성 함수
function createPageButton(page) {
    const pageButton = document.createElement('button');
    pageButton.textContent = page;
    if (page === currentPage) {
        pageButton.disabled = true;
    }
    pageButton.addEventListener('click', () => {
        currentPage = page;
        displayPosts(filteredPosts);
    });
    return pageButton;
}

// 생략 표시(...) 버튼 생성 함수
function createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.className = 'ellipsis';
    return ellipsis;
}

// 검색 기능 수정
async function loadPosts(searchTerm = '') {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        let posts = [];
        querySnapshot.forEach((doc) => {
            const postData = doc.data();
            posts.push({
                id: doc.id,
                title: postData.title
            });
        });

        console.log("Loaded Posts:", posts);  // 로드된 게시물 확인

        if (searchTerm) {
            posts = filterPostsBySearchTerm(posts, searchTerm);
        }

        filteredPosts = posts; // 필터된 게시물 저장
        currentPage = 1; // 검색 후 첫 페이지로 초기화
        displayPosts(filteredPosts);
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

// 검색어를 기준으로 필터링하는 함수
function filterPostsBySearchTerm(posts, searchTerm) {
    return posts.filter(post => {
        const title = post.title ? post.title.toLowerCase() : '';
        return title.includes(searchTerm) || fuzzySearch(searchTerm, title);
    });
}

// 간단한 초성 검색 및 유사 검색 구현
function fuzzySearch(needle, haystack) {
    const needleChars = needle.split('');
    const haystackChars = haystack.split('');
    let index = 0;
    return needleChars.every(char => {
        index = haystackChars.indexOf(char, index);
        return index !== -1;
    });
}


// 동적 스타일 추가
export function addnoticesStyles() {
    const style = document.createElement('style');
    style.id = 'notices-styles';
    style.textContent = `
        @font-face {
            font-family: 'HS산토끼체'; /* 원하는 폰트 이름으로 지정 */
            src: url('/assets/fonts/HSSanTokki2.0(2024).ttf') format('truetype');
            
        }

        @font-face {
            font-family: 'KoPubDotum Medium'; 
            src: url('/assets/fonts/KoPubWorld Dotum Medium.ttf') format('truetype');
        }
    
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .content {
            max-width: 1200px;
            margin: 20px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #007bff;
        }

        .main-title{
        font-size: 44px; 
        color: #6F6F6F; 
        font-family: 'HS산토끼체'; 
        }

        #searchInput {
            
            width: 90%;
            padding: 10px;
            margin-bottom: 20px;
            font-size: 1em;
            border: 3px solid #77DEEF;
            border-radius: 30px;
            font-family: 'KoPubDotum Medium';
        }
        




        #newPostButton {
            margin-bottom: 20px;
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            font-family: 'KoPubDotum Medium';
        }

        #newPostButton:disabled {
            background-color: #87CEEB;
            cursor: not-allowed;
        }

        #postsContainer .post {
            width: 90%;
            margin: 10px 0;
            padding: 15px;
            background-color: #ffffff;
            cursor: pointer;
            border-bottom: 2px solid #77DEEF;
            font-size: 1.2em;
            font-family: 'KoPubDotum Medium';
        }

        #postsContainer .post:hover {
            background-color: #f0f8ff;
        }

        #paginationContainer {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            
        }

        #paginationContainer button {
            margin: 5px;
            padding: 5px 10px;
            font-size: 1.2em;
            color: #77DEEF;
            cursor: pointer;
            background-color: #ffffff;
            border: 3px solid #ffffff;
        }

        .ellipsis {
            margin: 0 5px;
            font-size: 1em;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenotices() {
    const style = document.getElementById('notices-styles');
    if (style) {
        style.remove();
    }
}