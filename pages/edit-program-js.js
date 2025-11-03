// pages/edit-program.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export function rendereditprogram() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="program-container">
            <h1>프로그램 수정</h1>
            <form id="programForm">
                <label for="programTitle">제목:</label>
                <input type="text" id="programTitle" required><br><br>

                <label for="programPhoto">사진:</label>
                <input type="file" id="programPhoto" accept="image/*"><br><br>

                <label for="programDeadline">마감 기한:</label>
                <input type="datetime-local" id="programDeadline" required><br><br>

                <label for="programPinned">프로그램 고정:</label>
                <input type="checkbox" id="programPinned"><br><br>

                <button type="submit">수정</button>
            </form>
        </div>
    `;

    setupEventListeners();
    loadProgramDetails();
    addeditprogramStyles(); // 스타일 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('programForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('programTitle').value;
        const file = document.getElementById('programPhoto').files[0];
        const deadline = document.getElementById('programDeadline').value;
        const isPinned = document.getElementById('programPinned').checked;

        // URL 해시를 통해 id를 추출
        const hash = window.location.hash || "";
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const programId = hashParams.get('id');

        // programId가 유효하지 않은 경우 처리
        if (!programId) {
            console.error("프로그램 ID가 유효하지 않습니다. URL에서 ID를 찾을 수 없습니다.");
            alert("유효하지 않은 프로그램 ID입니다.");
            return;
        }

        try {
            let photoUrl;
            if (file) {
                const uniqueFileName = `${Date.now()}_${file.name}`;
                const resizedImage = await resizeImage(file, 210, 210);
                const storageRef = ref(storage, `programs/${uniqueFileName}`);
                await uploadBytes(storageRef, resizedImage);
                photoUrl = await getDownloadURL(storageRef);
            }

            const programData = {
                title,
                deadline,
                isPinned
            };
            if (photoUrl) {
                programData.photoUrl = photoUrl;
            }

            await updateDoc(doc(db, "programs", programId), programData);

            alert('프로그램이 성공적으로 수정되었습니다!');
            window.location.hash = 'programs';
        } catch (error) {
            console.error("프로그램 수정 중 오류가 발생했습니다.", error);
            alert('프로그램 수정 중 오류가 발생했습니다.');
        }
    });
}


// 프로그램 세부 사항 로드 
async function loadProgramDetails() {
    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const programId = hashParams.get('id');

    // programId가 유효하지 않은 경우 처리
    if (!programId) {
        console.error("프로그램 ID가 유효하지 않습니다. URL에서 ID를 찾을 수 없습니다.");
        alert("유효하지 않은 프로그램 ID입니다.");
        window.location.hash = 'programs'; // 프로그램 목록 페이지로 이동
        return;
    }

    try {
        // Firestore에서 프로그램 문서 가져오기
        const programDoc = await getDoc(doc(db, "programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();

            // 프로그램 데이터를 각 필드에 설정
            const titleElement = document.getElementById('programTitle');
            const deadlineElement = document.getElementById('programDeadline');
            const pinnedElement = document.getElementById('programPinned');

            if (titleElement) titleElement.value = programData.title || '';
            if (deadlineElement) deadlineElement.value = programData.deadline || '';
            if (pinnedElement) pinnedElement.checked = programData.isPinned || false;
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'programs';
        }
    } catch (error) {
        console.error("프로그램 세부 사항을 로드하는 중 오류가 발생했습니다:", error);
        alert("프로그램 세부 사항을 로드하는 중 오류가 발생했습니다.");
    }
}


// 이미지 크기 조정
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                ctx.drawImage(img, 0, 0, maxWidth, maxHeight);
                canvas.toBlob(resolve, file.type);
            };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 동적 스타일 추가
export function addeditprogramStyles() {
    const style = document.createElement('style');
    style.id = 'edit-program-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }
        
        .program-container {
            max-width: 600px;
            margin: 80px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        form label {
            display: block;
            margin-top: 15px;
            font-size: 1.1em;
            color: #333;
        }
        
        form input[type="text"],
        form input[type="file"],
        form input[type="datetime-local"],
        form input[type="checkbox"] {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }
        
        form input[type="checkbox"] {
            width: auto;
        }
        
        form button[type="submit"] {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #00BFFF; 
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            width: 100%;
        }

        form button[type="submit"]:hover {
            background-color: #1E90FF; 
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeeditprogram() {
    const style = document.getElementById('edit-program-styles');
    if (style) {
        style.remove();
    }
}