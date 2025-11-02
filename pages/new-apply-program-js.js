// new-apply-program-js.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export function rendernewapplyprogram() {
    document.getElementById('app').innerHTML = `
        <div class="form-container">
            <h1>새 참여방법 작성</h1>
            <div class="form-group">
                <label for="title">제목</label>
                <input type="text" id="title" placeholder="프로그램 제목 입력">
            </div>
            <div class="form-group">
                <label for="photos">사진 업로드 (여러장 가능)</label>
                <input type="file" id="photos" accept="image/*" multiple>
            </div>
            <div class="form-group">
                <label for="description">설명</label>
                <textarea id="description" rows="5" placeholder="참여방법 설명 입력"></textarea>
            </div>
            <div class="form-group">
                <button id="submitBtn">업로드</button>
            </div>
        </div>
    `;

    setupNewApplyProgramEvents();
    addnewapplyprogramStyles();
}

function setupNewApplyProgramEvents() {
    document.getElementById('submitBtn').addEventListener('click', async () => {
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const photoFiles = document.getElementById('photos').files;

        if (!title || !description) {
            alert("제목과 설명을 입력해 주세요.");
            return;
        }

        let programId = new URLSearchParams(window.location.hash.split('?')[1]).get('id');
        if (!programId) {
            alert("유효한 프로그램 ID가 필요합니다.");
            return;
        }

        const photoUrls = [];
        for (const file of photoFiles) {
            const storageRef = ref(storage, `programs/${programId}/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            photoUrls.push(downloadUrl);
        }

        const programRef = doc(db, "programs", programId);
        const newProgramData = {
            applyTitle: title,
            applyDescription: description,
            applyPhotos: photoUrls
        };

        await setDoc(programRef, newProgramData, { merge: true });
        alert("프로그램이 성공적으로 업로드되었습니다!");
        window.location.hash = `applyprogram?id=${programId}`;
    });
}


// UUID 생성 함수
function generateUUID() {
    var d = new Date().getTime();
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;
        if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// 동적 스타일 추가
export function addnewapplyprogramStyles() {
    const style = document.createElement('style');
    style.id = 'new-apply-program-styles';
    style.textContent = `
    body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF; /* 밝은 하늘색 */
            margin: 0;
            padding-top: 120px; /* 상단 네비게이션 바 높이 + 여유 공간 */
        }

        .form-container {
            max-width: 900px;
            margin: 0 auto;
            text-align: center;
            background-color: white; /* 흰색 */
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: bold;
            color: #007bff; /* 밝은 푸른색 */
        }

        .form-group input, .form-group textarea {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            border: 2px solid #00BFFF; /* 하늘색 */
            border-radius: 5px;
        }

        .form-group input[type="file"] {
            padding: 5px;
        }

        .form-group button {
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 20px;
            transition: background-color 0.3s ease;
        }

        .form-group button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }
        
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewapplyprogram() {
    const style = document.getElementById('new-apply-program-styles');
    if (style) {
        style.remove();
    }
}

