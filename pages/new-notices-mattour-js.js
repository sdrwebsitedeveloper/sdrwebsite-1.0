// pages/new-notices-mattour.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export function rendernewnoticesmattour() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>맛투어 새 공지사항 작성</h1>
            <form id="noticeForm" class="form-group">
                <div class="form-group">
                    <label for="title">제목</label>
                    <input type="text" id="title" required>
                </div>
                <div class="form-group">
                    <label for="content">내용</label>
                    <textarea id="content" rows="5" required></textarea>
                </div>
                <div class="form-group">
                    <label for="attachments">첨부 파일</label>
                    <input type="file" id="attachments" multiple>
                </div>
                <div class="form-group">
                    <label for="importantNotice">중요공지</label>
                    <input type="checkbox" id="importantNotice">
                </div>
                <button type="submit" class="submit-button">공지 올리기</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addnewnoticesmattourStyles(); // 스타일 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('noticeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const isImportant = document.getElementById('importantNotice').checked;
        const files = document.getElementById('attachments').files;

        const attachments = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = ref(storage, 'mattour-notices/' + file.name);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            attachments.push({ name: file.name, url: downloadURL });
        }

        await addDoc(collection(db, "mattour-notices"), {
            title: title,
            content: content,
            attachments: attachments,
            isImportant: isImportant,
            createdAt: new Date()
        });

        alert('공지사항이 성공적으로 업로드되었습니다.');
        window.location.hash = 'notices-mattour'; // SPA 방식으로 이동
    });
}

// 동적 스타일 추가
export function addnewnoticesmattourStyles() {
    const style = document.createElement('style');
    style.id = 'new-notices-mattour-styles';
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

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
        }

        .form-group input, .form-group textarea {
            width: 100%;
            padding: 10px;
            font-size: 1em;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .form-group input[type="file"] {
            padding: 0;
        }

        .submit-button {
            padding: 10px 20px;
            font-size: 1.2em;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .submit-button:hover {
            background-color: #45a049;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewnoticesmattour() {
    const style = document.getElementById('new-notices-mattour-styles');
    if (style) {
        style.remove();
    }
}

