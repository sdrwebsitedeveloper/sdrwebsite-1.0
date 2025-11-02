// pages/edit-notices-uflex.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function rendereditnoticesuflex() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>공지사항 수정</h1>
            <form id="editNoticeForm">
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
                    <input type="checkbox" id="importantNotice">
                    <label for="importantNotice">중요공지</label>
                </div>

                <button type="submit" class="submit-button">수정하기</button>
            </form>
        </div>
    `;

    // 바로 loadNoticeForEdit()와 setupEventListeners 호출
    loadNoticeForEdit();
    setupEventListeners(); // 이벤트 리스너 설정

    addeditnoticesuflexStyles(); // 스타일 추가
}

// 기존 JS 기능 실행
function setupEventListeners() {
    document.getElementById('editNoticeForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const isImportant = document.getElementById('importantNotice').checked;

        const hash = window.location.hash || "";
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const noticeId = hashParams.get('id');

        await updateDoc(doc(db, "notices", noticeId), {
            title: title,
            content: content,
            isImportant: isImportant
        });

        alert('공지사항이 수정되었습니다.');
        // 수정 후 noticesuflex 페이지로 이동
        window.location.hash = `noticesuflex`;
    });
}

async function loadNoticeForEdit() {
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const noticeId = hashParams.get('id');

    if (!noticeId) {
        console.error("공지사항 ID가 유효하지 않습니다. URL에서 ID를 찾을 수 없습니다.");
        alert("유효하지 않은 공지사항 ID입니다.");
        return;
    }

    try {
        const noticeRef = doc(db, "notices", noticeId);
        const noticeDoc = await getDoc(noticeRef);
        if (noticeDoc.exists()) {
            const noticeData = noticeDoc.data();
            document.getElementById('title').value = noticeData.title || '제목 없음';
            document.getElementById('content').value = noticeData.content || '내용 없음';
            document.getElementById('importantNotice').checked = noticeData.isImportant || false;

            const attachmentsDiv = document.getElementById('attachments');
            attachmentsDiv.innerHTML = ''; 
            if (noticeData.attachments && Array.isArray(noticeData.attachments)) {
                noticeData.attachments.forEach(file => {
                    const a = document.createElement('a');
                    a.href = file.url;
                    a.textContent = file.name;
                    attachmentsDiv.appendChild(a);
                });
            } else {
                attachmentsDiv.textContent = '첨부 파일이 없습니다.';
            }
        } else {
            console.error("해당 공지사항을 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("공지사항을 불러오는 중 오류가 발생했습니다:", error);
    }
}




// 스타일 동적 추가
export function addeditnoticesuflexStyles() {
    const style = document.createElement('style');
    style.id = 'edit-notices-uflex-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }
        
        h1 {
            text-align: center;
            color: #007bff;
            margin-bottom: 20px;
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
            color: #007bff;
        }
        
        .form-group input, .form-group textarea {
            width: 100%;
            padding: 10px;
            font-size: 1em;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        
        .submit-button {
            padding: 10px 20px;
            font-size: 1.2em;
            background-color: #00BFFF; 
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .submit-button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 스타일 동적 제거
export function removeeditnoticesuflex() {
    const style = document.getElementById('edit-notices-uflex-styles');
    if (style) {
        style.remove();
    }
}