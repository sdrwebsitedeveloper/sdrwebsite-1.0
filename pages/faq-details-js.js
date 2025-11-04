// pages/faq-details.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-functions.js";

import { firebaseConfig } from "../firebase.js";

export function renderfaqdetails() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <h1 id="faqTitle"></h1>
        <p id="faqContent"></p>

        <div id="commentsList" class="comments-list"></div>

        <div id="commentInputSection" style="display: none;">
            <input type="text" id="nicknameInput" placeholder="닉네임">
            <textarea id="commentInput" placeholder="댓글을 입력해주세요"></textarea>
            <button onclick="submitComment()">댓글 작성</button>
        </div>

        <p id="loginReminder" style="display: none;">답변이 달릴시에 입력해주신 메일로 알람이 갑니다.</p>
    `;

    setupEventListeners();
    addfaqdetailsStyles(); // 동적 스타일 추가
}

function setupEventListeners() {
    // FAQ ID 추출
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const faqId = params.get('id');

    // Firebase 초기화
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const database = getDatabase(app);

    const faqTitle = document.getElementById('faqTitle');
    const faqContent = document.getElementById('faqContent');
    const commentsList = document.getElementById('commentsList');
    const commentInputSection = document.getElementById('commentInputSection');
    const loginReminder = document.getElementById('loginReminder');

    const commentsRef = ref(database, 'faqs/' + faqId + '/comments');
    const functions = getFunctions();  // Firebase Functions 초기화

    // 인증 상태 확인
    onAuthStateChanged(auth, user => {
        if (user) {
            commentInputSection.style.display = 'block';
            loginReminder.style.display = 'none';
        } else {
            commentInputSection.style.display = 'none';
            loginReminder.style.display = 'block';
        }
    });

    // 문의 내용을 가져와서 표시
    const faqRef = ref(database, 'faqs/' + faqId);
    onValue(faqRef, (snapshot) => {
        const faq = snapshot.val();
        if (faq) {
            faqTitle.textContent = faq.title;
            faqContent.textContent = faq.content;
        } else {
            faqTitle.textContent = 'FAQ를 찾을 수 없습니다.';
            faqContent.textContent = '';
        }
    });

    // 댓글 목록을 가져와서 표시
    onValue(commentsRef, (snapshot) => {
        commentsList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const commentId = childSnapshot.key;
            const comment = childSnapshot.val();
            const div = document.createElement('div');
            div.className = 'comment';
            div.innerHTML = `<strong>${comment.nickname}</strong>: ${comment.text}`;

            if (auth.currentUser) {
                const editButton = document.createElement('span');
                editButton.className = 'comment-actions';
                editButton.textContent = '수정';
                editButton.onclick = () => editComment(commentId, comment.text, comment.nickname);
                div.appendChild(editButton);

                const deleteButton = document.createElement('span');
                deleteButton.className = 'comment-actions';
                deleteButton.textContent = '삭제';
                deleteButton.onclick = () => deleteComment(commentId);
                div.appendChild(deleteButton);
            }

            commentsList.appendChild(div);
        });
    });

    window.submitComment = function() {
        const nickname = document.getElementById('nicknameInput').value;
        const commentText = document.getElementById('commentInput').value;
            if (nickname && commentText) {
                console.log("댓글 작성 시작");  // 로그 추가
                const newCommentRef = push(commentsRef);
                set(newCommentRef, { nickname: nickname, text: commentText })
                    .then(() => {
                        console.log("댓글 작성 성공");  // 로그 추가
                        document.getElementById('nicknameInput').value = '';
                        document.getElementById('commentInput').value = '';
                        sendEmailNotification(faqId);  // 댓글이 추가된 후 이메일 알림
                    })
                    .catch((error) => {
                        console.error('댓글 작성 중 오류가 발생했습니다:', error.message);  // 오류 로그 추가
                        alert('댓글 작성 중 오류가 발생했습니다: ' + error.message);
                    });
            } else {
                alert('닉네임과 댓글을 모두 입력해주세요.');
            }
        }
            // 이메일 알림 함수 호출
        function sendEmailNotification(faqId) {
            const sendEmail = httpsCallable(functions, 'sendEmailNotification');
            sendEmail({ faqId: faqId })
                .then(() => {
                    console.log('이메일 알림이 성공적으로 전송되었습니다.');
                })
                .catch((error) => {
                    console.error('이메일 알림 전송 중 오류가 발생했습니다:', error);
                });
        }
        // 댓글 수정 기능
        window.editComment = function(commentId, oldText, oldNickname) {
            const newText = prompt('댓글 수정:', oldText);
            const newNickname = prompt('닉네임 수정:', oldNickname);
            if (newText !== null && newText !== '' && newNickname !== null && newNickname !== '') {
                const commentRef = ref(database, `faqs/${faqId}/comments/${commentId}`);
                update(commentRef, { text: newText, nickname: newNickname })
                    .catch((error) => {
                        alert('댓글 수정 중 오류가 발생했습니다: ' + error.message);
                    });
            }
        }

        // 댓글 삭제 기능
        window.deleteComment = function(commentId) {
            if (confirm('댓글을 삭제하시겠습니까?')) {
                const commentRef = ref(database, `faqs/${faqId}/comments/${commentId}`);
                remove(commentRef)
                    .catch((error) => {
                        alert('댓글 삭제 중 오류가 발생했습니다: ' + error.message);
                    });
            }
        }
    
}





// 동적 스타일 추가
export function addfaqdetailsStyles() {
    const style = document.createElement('style');
    style.id = 'faq-details-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }
        
        .content {
            max-width: 1200px;
            margin: 50px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            white-space: pre-wrap;
            text-align: left;
        }
        .content h1{
            border-bottom: 2px solid #000; 
            padding-bottom: 10px;
        }
        
        .comment-container {
            margin-top: 20px;
        }
        
        .comment {
            margin-bottom: 10px;
        }
        
        .comment-actions {
            margin-left: 10px;
            cursor: pointer;
            color: blue;
        }

        .comment-actions:hover {
            text-decoration: underline;
        }
        
        #commentInputSection input,
        #commentInputSection textarea {
            width: 90%;
            margin: 5px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }
        
        #commentInputSection button {
            padding: 10px 20px;
            font-size: 1.2em;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        #commentInputSection button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removefaqdetails() {
    const style = document.getElementById('faq-details-styles');
    if (style) {
        style.remove();
    }
}