// apply-program-js.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase-config.js";

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export function renderapplyPrograms() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="program-container">
            <button class="create-button" id="createProgramButton" style="display:none;">참여방법 작성 및 수정</button>
            <h1 class="program-title" id="programTitle">프로그램 제목</h1>
            <div id="photoContainer"></div>
            <p class="program-description" id="programDescription">여기에 참여방법이나 구글폼, 카톡 방등을 올려주세요</p>
        </div>
    `;

    setupEventListeners();
    loadProgramData(); // 프로그램 데이터 로드
    // 스타일 동적 추가
    addapplyProgramsStyles(); // 스타일을 추가하는 함수 호출
}

async function loadProgramData() {
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const programId = hashParams.get('id');

    if (!programId) {
        alert("유효하지 않은 프로그램 ID입니다.");
        window.location.hash = 'programs';
        return;
    }

    try {
        const programDoc = await getDoc(doc(db, "programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();
            document.getElementById('programTitle').textContent = programData.applyTitle || '제목 없음';
            document.getElementById('programDescription').textContent = programData.applyDescription || '여기에 참여방법이나 필요하다면 구글폼, 카톡 방등을 올려주세요';

            const photoContainer = document.getElementById('photoContainer');
            if (programData.applyPhotos && programData.applyPhotos.length > 0) {
                programData.applyPhotos.forEach(photoUrl => {
                    const img = document.createElement('img');
                    img.src = photoUrl;
                    img.classList.add('program-photo');
                    photoContainer.appendChild(img);
                });
            } else {
                photoContainer.innerHTML = '<p>사진 없음</p>';
            }
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'programs';
        }
    } catch (error) {
        console.error("프로그램 데이터를 로드하는 중 오류가 발생했습니다:", error);
        alert("프로그램 데이터를 로드하는 중 오류가 발생했습니다.");
    }
}

function setupEventListeners() {
    const createProgramButton = document.getElementById('createProgramButton');

    onAuthStateChanged(auth, user => {
        if (user) {
            createProgramButton.style.display = 'inline-block';
            createProgramButton.addEventListener('click', () => {
                window.location.hash = `newapplyprogram?id=${getProgramIdFromURL()}`;
            });
        }
    });
}

// URL에서 programId를 추출하는 헬퍼 함수
function getProgramIdFromURL() {
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    return hashParams.get('id');
}


// applyPrograms 페이지 스타일 추가
export function addapplyProgramsStyles() {
    // 이미 스타일이 추가되었는지 확인
    if (document.getElementById('apply-program-styles')) return;

    const style = document.createElement('style');
    style.id = 'apply-program-styles';
    style.textContent = `

        body {
            font-family: 'KoPubDotum Medium';
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .program-container {
            max-width: 900px;
            margin: 50px auto;
            margin-top: 50px;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .program-title {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .program-description {
            font-size: 20px;
            color: #333;
        }
        .program-photo {
            width: 100%;
            max-width: 700px;
            height: auto;
        }
        .create-button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1em;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-align: center;
            display: inline-block;
        }

        .create-button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }
    `;
    document.head.appendChild(style);
}

// applyPrograms 페이지 스타일 제거
export function removeapplyProgramsStyles() {
    const style = document.getElementById('apply-program-styles');
    if (style) {
        style.remove();
    }
}