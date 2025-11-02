// pages/notices-uflex.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function rendernoticesuflex() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>UFLEX 공지사항</h1>
            <ul id="noticesList" class="notice-list"></ul>
            <button id="newNoticeButton" class="upload-button" style="display: none">새 공지 올리기</button>
        </div>
    `;

    setupEventListeners();
    addnoticesuflexStyles(); // 동적 스타일 추가
    loadNotices();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('newNoticeButton').addEventListener('click', () => {
        window.location.hash = 'newnoticesuflex';
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            document.getElementById('newNoticeButton').style.display = 'inline-block';
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'block';
        } else {
            document.getElementById('loginButton').style.display = 'block';
            document.getElementById('logoutButton').style.display = 'none';
        }
    });
}

// 공지사항 목록 불러오기
async function loadNotices() {
    const noticesList = document.getElementById('noticesList');
    noticesList.innerHTML = '';

    try {
        const q = query(collection(db, "notices"), orderBy("isImportant", "desc"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const noticeData = doc.data();
            const li = document.createElement('li');
            li.classList.add('notice-item');

            const a = document.createElement('a');
            a.href = `#noticesdetailsuflex?id=${doc.id}`; // SPA 방식으로 변경
            a.textContent = noticeData.title;

            if (noticeData.isImportant) {
                li.classList.add('important-notice');
            }

            li.appendChild(a);
            noticesList.appendChild(li);
        });
    } catch (error) {
        console.error("공지사항을 불러오는 중 오류가 발생했습니다:", error);
        alert("공지사항을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
}

// 동적 스타일 추가
export function addnoticesuflexStyles() {
    const style = document.createElement('style');
    style.id = 'notices-uflex-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #6F6F6F;
            margin-bottom: 20px;
            font-family: 'HS산토끼체';

        }

        .notice-list {
            list-style: none;
            padding: 0;
        }

        .notice-item {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        .notice-item a {
            text-decoration: none;
            color: #333;
            font-size: 1.2em;
        }

        .notice-item a:hover {
            text-decoration: underline;
        }

        .important-notice {
            font-weight: bold;
            color: red;
        }

        .upload-button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 20px;
            display: none;
            transition: background-color 0.3s ease;
        }

        .upload-button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenoticesuflex() {
    const style = document.getElementById('notices-uflex-styles');
    if (style) {
        style.remove();
    }
}