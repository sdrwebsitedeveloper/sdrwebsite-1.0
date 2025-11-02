// pages/login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function renderlogin() {
    console.log("renderlogin function called"); // 확인 메시지
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>로그인 및 회원가입</h1>

            <div>
                <h2>로그인</h2>
                <input type="email" id="loginEmail" placeholder="Email">
                <input type="password" id="loginPassword" placeholder="Password">
                <button id="loginButton">로그인</button>
            </div>

            <div>
                <h2>회원가입</h2>
                <input type="text" id="signupDisplayName" placeholder="연뚜리 명(ex: 홈프로텍터 연뚜리),(오직 선뚜리 부원만 가입 승인됩니다)">
                <input type="email" id="signupEmail" placeholder="Email">
                <input type="password" id="signupPassword" placeholder="Password">
                <button id="signupButton">회원가입</button>
            </div>
        </div>
    `;

    // 네비게이션 바 숨기기
    const navBar = document.getElementById('navigationButtons');
    if (navBar) {
        navBar.style.display = 'none';
    }

    // setTimeout을 사용하여 DOM 업데이트가 완료된 후 이벤트 리스너 추가
    setTimeout(setupEventListeners, 0);

    addloginStyles(); // 스타일 동적 추가
}

function setupEventListeners() {
    console.log("setupEventListeners called"); // 확인 메시지

    // 이벤트 위임을 통해 클릭 이벤트 처리
    document.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'signupButton') {
            console.log("Sign-up button clicked via delegation");
            handleSignUp();
        }
        
        if (event.target && event.target.id === 'loginButton') {
            console.log("Login button clicked via delegation");
            handleLogin();
        }
    });
}

async function handleSignUp() {
    console.log("Sign-up process started");

    const displayName = document.getElementById('signupDisplayName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            displayName: displayName,
            email: email,
            approved: false,
        });

        await signOut(auth);

        alert("Sign up successful! Awaiting approval.");
    } catch (error) {
        console.error("Error signing up:", error);
        alert(error.message);
    }
}

async function handleLogin() {
    console.log("Login process started");

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().approved) {
            alert("Login successful!");
            window.location.hash = 'dashboard'; // SPA 방식으로 이동
            window.location.reload(); // 대시보드로 이동 후 페이지 새로고침
        } else {
            alert("User not approved. Please wait for approval.");
            await signOut(auth);
        }
    } catch (error) {
        console.error("Error logging in:", error);
        alert(error.message);
    }
}



// 동적 스타일 추가
export function addloginStyles() {
    const style = document.createElement('style');
    style.id = 'login-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF; 
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            background-color: white; 
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
        }

        h1 {
            text-align: center;
            color: #007bff;
        }

        input[type="email"], input[type="password"], input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }

        button {
            width: 100%;
            padding: 10px;
            background-color: #00BFFF; 
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            margin-top: 10px;
        }

        button:hover {
            background-color: #1E90FF; 
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removelogin() {
    const style = document.getElementById('login-styles');
    if (style) {
        style.remove();
    }
    
    // 네비게이션 바 다시 보이게 하기
    const navBar = document.getElementById('navigationButtons');
    if (navBar) {
        navBar.style.display = 'block';
    }
}