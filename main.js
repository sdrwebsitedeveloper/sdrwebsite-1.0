// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { handleRouteChange } from './router.js'; // 라우터 모듈 불러오기
import { firebaseConfig } from "../firebase-config.js";



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function() {
    function toggleMenu() {
        var navItems = document.getElementById("navItems");
        if (navItems.style.display === "block") {
            navItems.style.display = "none";
        } else {
            navItems.style.display = "block";
        }
    }

    document.querySelector(".menu-toggle").addEventListener("click", function() {
        var navItems = document.querySelector(".menu-items");
        navItems.classList.toggle("open");
    });

        // 메뉴 항목 버튼 클릭 시 토글바 닫기
    document.querySelectorAll(".menu-items button").forEach(function(button) {
        button.addEventListener("click", function() {
            var navItems = document.querySelector(".menu-items");
            if (navItems.classList.contains("open")) {
                navItems.classList.remove("open");
            }
        });
    });
});


document.getElementById('loginButton').addEventListener('click', () => {
    window.location.href='#login';
});

document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("로그아웃 되었습니다!");
        window.location.reload();
    } catch (error) {
        console.error("로그아웃 오류:", error);
        alert(error.message);
    }
});

document.getElementById('adminButton').addEventListener('click', () => {
    window.location.href = '#admin';
});

onAuthStateChanged(auth, user => {
    if (user) {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'block';
        document.getElementById('adminButton').style.display = 'block';
        // 로그인 상태일 때 버튼 활성화
    } 
    else {
        document.getElementById('loginButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'none';
        document.getElementById('adminButton').style.display = 'none';
    }
});

function isEmbedMode() {
    // 1. 쿼리 파라미터로 embed 상태 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('embed') === 'true') {
        return true;
    }

    // 2. 해시로 embed 상태 확인
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (hashParams.get('embed') === 'true') {
        return true;
    }

    // 3. iframe 임베드 여부 확인
    if (window.self !== window.top) {
        console.log('임베드 상태: iframe 안에서 실행 중');
        return true;
    }

    // 4. 기본 상태 (임베드 아님)
    return false;
}

function handleEmbedMode() {
    const isEmbed = isEmbedMode();
    const navigationButtons = document.getElementById('navigationButtons');

    if (isEmbed) {
        console.log('임베드 상태입니다. 네비게이션 바를 숨깁니다.');
        if (navigationButtons) {
            navigationButtons.style.display = 'none'; // 숨기기
        } else {
            console.error('네비게이션 바 요소를 찾을 수 없습니다!');
        }
    } else {
        console.log('일반 상태입니다. 네비게이션 바를 표시합니다.');
        if (navigationButtons) {
            navigationButtons.style.display = 'flex'; // 다시 표시
        }
    }
}


// DOMContentLoaded 이벤트에서 실행
document.addEventListener('DOMContentLoaded', () => {
    handleEmbedMode();
});


function loadPage() {
    // 임베드 상태 처리
    handleEmbedMode();

    const hash = window.location.hash.replace('#', '');

    // 페이지별 렌더링 (필요시 추가)
    if (hash.includes('faq')) {
        renderfaq();
    } else if (hash.includes('dashboard')) {
        renderDashboard();
    }
}

// 초기 라우팅 설정
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('popstate', handleEmbedMode);
window.dispatchEvent(new Event('hashchange'));
