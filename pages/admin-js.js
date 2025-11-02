import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-functions.js";

import { firebaseConfig } from "../firebase.js";

// Firebase 초기화
const app = initializeApp(firebaseConfig); // firebase.initializeApp() 대신 initializeApp() 사용

// Firebase 데이터베이스와 함수 가져오기
const database = getDatabase(app);
const functions = getFunctions(app);

let allFaqs = [];

// **렌더링 및 스타일 함수 추가**
// SPA용 admin 페이지 렌더링 함수
export function renderadmin() {
    document.getElementById('app').innerHTML = `
        <h1>FAQ 관리 페이지</h1>
        <input type="text" id="searchInput" placeholder="제목, 내용 또는 IP로 검색">
        <button onclick="searchFaq()">검색</button>
        <div id="faqList">로딩 중...</div>
    `;

    // FAQ 목록 불러오기
    fetchAndDisplayFaqs();
    addadminStyles();
}

// FAQ 데이터를 가져오는 함수
async function fetchAndDisplayFaqs() {
    const faqsRef = ref(database, 'faqs');
    allFaqs = []; // 모든 FAQ 초기화

    onValue(faqsRef, (snapshot) => {
        const faqListDiv = document.getElementById('faqList');
        faqListDiv.innerHTML = ''; // 기존 내용 초기화

        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const faq = childSnapshot.val();
                faq.id = childSnapshot.key; // 각 FAQ에 고유 ID 추가
                allFaqs.push(faq); // FAQ 목록 저장
                displayFaq(faq); // 개별 FAQ 표시
            });
        } else {
            faqListDiv.innerHTML = '<p>등록된 FAQ가 없습니다.</p>';
        }
    }, (error) => {
        console.error('FAQ를 가져오는 중 오류 발생:', error);
        document.getElementById('faqList').innerHTML = '<p>FAQ를 가져오는 중 오류가 발생했습니다.</p>';
    });
}

// 개별 FAQ를 화면에 표시하는 함수
function displayFaq(faq) {
    const faqListDiv = document.getElementById('faqList');
    const faqItemDiv = document.createElement('div');
    faqItemDiv.classList.add('faq-item');
    faqItemDiv.innerHTML = `
        <h3>${faq.title}</h3>
        <p>${faq.content}</p>
        <p><strong>작성자 IP:</strong> ${faq.ip || 'IP 정보 없음'}</p>
        <button class="block-button" onclick="blockIP('${faq.ip}')">IP 차단하기</button>
        <button class="unblock-button" onclick="unblockIP('${faq.ip}')">IP 차단 해제</button>
        <button class="delete-button" onclick="deleteFaq('${faq.id}')">글 삭제하기</button>
    `;
    faqListDiv.appendChild(faqItemDiv);
}

// 검색 기능 구현
window.searchFaq = function() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filteredFaqs = allFaqs.filter(faq => {
        const title = faq.title.toLowerCase();
        const content = faq.content.toLowerCase();
        const ip = (faq.ip || '').toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm) || ip.includes(searchTerm);
    });

    displaySearchResults(filteredFaqs);
}

// 검색 결과 표시
function displaySearchResults(filteredFaqs) {
    const faqListDiv = document.getElementById('faqList');
    faqListDiv.innerHTML = ''; // 기존 내용 초기화

    if (filteredFaqs.length > 0) {
        filteredFaqs.forEach(faq => displayFaq(faq));
    } else {
        faqListDiv.innerHTML = '<p>검색 결과가 없습니다.</p>';
    }
}

// IP 차단 및 해제 기능
window.blockIP = async function(ip) {
    if (confirm(`정말로 IP ${ip}를 차단하시겠습니까?`)) {
        try {
            const blockIPFunction = httpsCallable(functions, 'blockIP');
            const result = await blockIPFunction({ ip: ip });
            alert(result.data.message);
        } catch (error) {
            console.error('IP 차단 중 오류 발생:', error);
        }
    }
}

window.unblockIP = async function(ip) {
    if (confirm(`정말로 IP ${ip}의 차단을 해제하시겠습니까?`)) {
        try {
            const unblockIPFunction = httpsCallable(functions, 'unblockIP');
            const result = await unblockIPFunction({ ip: ip });
            alert(result.data.message);
        } catch (error) {
            console.error('IP 차단 해제 중 오류 발생:', error);
        }
    }
}

// FAQ 삭제
window.deleteFaq=function(faqId) {
    if (confirm('정말로 이 글을 삭제하시겠습니까?')) {
        const faqRef = ref(database, 'faqs/' + faqId);
        remove(faqRef).then(() => {
            alert('FAQ가 성공적으로 삭제되었습니다.');
            fetchAndDisplayFaqs(); // 삭제 후 목록 갱신
        }).catch((error) => {
            console.error('FAQ 삭제 중 오류 발생:', error);
        });
    }
}


// CSS 동적 추가
function addadminStyles() {
    const style = document.createElement('style');
    style.id = 'admin-style';
    style.textContent = `
                    h1 {
                text-align: center;
                margin-bottom: 40px;
                margin-top:160px;
                font-size: 44px; 
                color: #3F3F3F; 
                font-family: 'HS산토끼체'; 
            
            

            }
            .faq-item {
                background-color: #fff;
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .faq-item h3 {
                margin-top: 0;
            }
            .faq-item p {
                margin: 10px 0;
            }
            .faq-item button {
                margin-right: 10px;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                color: #fff;
            }
            .delete-button {
                background-color: #e74c3c;
            }
            .block-button {
                background-color: #3498db;
            }
            .unblock-button {
                background-color: #2ecc71;
            }
    `;
    document.head.appendChild(style);
}

// CSS 제거
export function removeadminStyles() {
    const style = document.getElementById('admin-style');
    if (style) {
        style.remove();
    }
}