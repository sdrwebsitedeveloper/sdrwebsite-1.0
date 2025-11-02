// pages/notices-details-mattour.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let noticeId;

export function rendernoticesdetailsmattour() {
    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    noticeId = hashParams.get('id'); // 해시에서 ID 추출

    // 공지사항 ID가 없는 경우 오류 처리
    if (!noticeId) {
        console.error("공지사항 ID가 유효하지 않습니다.");
        alert("유효하지 않은 공지사항 ID입니다.");
        window.location.hash = 'noticesmattor';
        return;
    }

    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1 id="noticeTitle" class="notice-title">공지사항 제목</h1>
            <div id="noticeContent" class="notice-content">공지사항 내용이 여기에 표시됩니다.</div>
            <div id="attachments" class="attachments">
                <h2>첨부 파일</h2>
            </div>
            <div class="actions">
                <button id="editNoticeButton">수정하기</button>
                <button id="deleteNoticeButton">삭제하기</button>
            </div>
        </div>
    `;

    setupEventListeners();
    addnoticesdetailsmattourStyles(); // 동적 스타일 추가
    loadNoticeDetails();
}


// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('deleteNoticeButton').addEventListener('click', async () => {
        if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
            await deleteDoc(doc(db, "mattour-notices", noticeId));
            alert('공지사항이 삭제되었습니다.');
            window.location.hash = 'noticesmattour'; // SPA 방식으로 이동
        }
    });

    document.getElementById('editNoticeButton').addEventListener('click', () => {
        window.location.hash = `editnoticesmattour?id=${noticeId}`; // SPA 방식으로 이동
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            document.getElementById('editNoticeButton').style.display = 'inline-block';
            document.getElementById('deleteNoticeButton').style.display = 'inline-block';
        }
    });
}

async function loadNoticeDetails() {
    if (noticeId) {
        try {
            const noticeDoc = await getDoc(doc(db, "mattour-notices", noticeId));
            if (noticeDoc.exists()) {
                const noticeData = noticeDoc.data();
                
                // 제목 및 내용 업데이트
                document.getElementById('noticeTitle').textContent = noticeData.title || '제목 없음';
                document.getElementById('noticeContent').textContent = noticeData.content || '내용 없음';
                
                // 첨부파일 처리
                const attachmentsDiv = document.getElementById('attachments');
                attachmentsDiv.innerHTML = ''; // 기존 내용을 지우기
                if (noticeData.attachments && Array.isArray(noticeData.attachments)) {
                    noticeData.attachments.forEach(file => {
                        const a = document.createElement('a');
                        a.href = file.url;
                        a.textContent = file.name;
                        attachmentsDiv.appendChild(a);
                    });
                } else {
                    const noAttachmentMessage = document.createElement('p');
                    noAttachmentMessage.textContent = '첨부 파일이 없습니다.';
                    attachmentsDiv.appendChild(noAttachmentMessage);
                }
            } else {
                console.error("해당 공지사항을 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("공지사항을 불러오는 중 오류가 발생했습니다:", error);
        }
    } else {
        console.error("공지사항 ID가 없습니다.");
    }
}

// 동적 스타일 추가
export function addnoticesdetailsmattourStyles() {
    const style = document.createElement('style');
    style.id = 'notices-details-mattour-styles';
    style.textContent = `
        body {
            font-family: 'KoPubDotum Medium', sans-serif;
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

        .notice-title {
            font-size: 2em;
            color: #6F6F6F;
            margin-bottom: 20px;
        }

        .notice-content {
            font-size: 1.2em;
            margin-bottom: 20px;
        }

        .attachments a {
            display: block;
            margin-bottom: 10px;
            color: #007bff;
            text-decoration: none;
        }

        .attachments a:hover {
            text-decoration: underline;
        }

        .actions {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .actions button {
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

        .actions button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenoticesdetailsmattour() {
    const style = document.getElementById('notices-details-mattour-styles');
    if (style) {
        style.remove();
    }
}