// pages/new-faq.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-functions.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const functions = getFunctions(app);
const auth = getAuth(app);

export function rendernewfaq() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content">
            <h1>새로운 문의 작성</h1>
            <input type="text" id="titleInput" placeholder="제목을 입력하세요" required>
            <textarea id="contentInput" placeholder="내용을 입력하세요" required></textarea>
            <input type="email" id="emailInput" placeholder="이메일을 입력하시면 해당 메일로 답변이 달리시에 알람이 전송됩니다" required>
            <button id="uploadbutton" onclick="uploadFaq()">업로드</button>
            <div id="errorMessage" class="error-message" style="display: none;"></div>
        </div>
    `;

    setupEventListeners();
    addnewfaqStyles(); // 스타일 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const checkIP = httpsCallable(functions, 'checkAndBlockIP');

    console.log(checkIP);

    window.uploadFaq = function () {
        const title = document.getElementById('titleInput').value;
        const content = document.getElementById('contentInput').value;
        const email = document.getElementById('emailInput').value;
        const errorMessage = document.getElementById('errorMessage');

        checkIP().then(result => {
            const ipInfo = result.data;
            const faqRef = ref(database, 'faqs');
            const newFaqRef = push(faqRef);
            set(newFaqRef, {
                title: title,
                content: content,
                email: email,
                ip: ipInfo.ip,
                timestamp: new Date().toISOString()
            }).then(() => {
                alert('글이 성공적으로 업로드되었습니다.');
                window.location.hash = 'faq'; // SPA 방식으로 이동
            }).catch((error) => {
                errorMessage.textContent = '업로드 중 오류가 발생했습니다: ' + error.message;
                errorMessage.style.display = 'block';
            });
        }).catch(error => {
            errorMessage.style.display = 'block';
            if (error.code === 'functions/invalid-argument') {
                errorMessage.textContent = '규정에 의해 차단된 IP입니다. 글을 작성할 수 없습니다.';
            } else {
                errorMessage.textContent = 'IP 확인 중 오류가 발생했습니다.';
                console.error('IP 확인 중 오류가 발생했습니다:', error);
            }
        });
    };

}

// 동적 스타일 추가
export function addnewfaqStyles() {
    const style = document.createElement('style');
    style.id = 'new-faq-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }

        .content {
            max-width: 800px;
            margin: 50px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        input[type="text"], input[type="email"], textarea {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }

        #uploadbutton {
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.3s ease;
            display: block;
            width: 100%;
        }

        #uploadbutton:hover {
            background-color: #1E90FF;
        }

        .error-message {
            color: red;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewfaq() {
    const style = document.getElementById('new-faq-styles');
    if (style) {
        style.remove();
    }
}