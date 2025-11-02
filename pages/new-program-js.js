// pages/new-program.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export function rendernewprogram() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="program-container">
            <h1>새 프로그램 추가</h1>
            <form id="programForm">
                <label for="programTitle">제목:</label>
                <input type="text" id="programTitle" required><br><br>

                <label for="programPhoto">사진:</label>
                <input type="file" id="programPhoto" accept="image/*" required><br><br>

                <label for="programDeadline">마감 기한:</label>
                <input type="datetime-local" id="programDeadline" required><br><br>

                <label for="programPinned">프로그램 고정:</label>
                <input type="checkbox" id="programPinned"><br><br>

                <button type="submit">제출</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addnewprogramStyles(); // 동적 스타일 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('programForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('programTitle').value;
        const file = document.getElementById('programPhoto').files[0];
        const deadline = document.getElementById('programDeadline').value;
        const isPinned = document.getElementById('programPinned').checked;

        try {
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const resizedImage = await resizeImage(file, 210, 210);
            const storageRef = ref(storage, `programs/${uniqueFileName}`);
            await uploadBytes(storageRef, resizedImage);
            const photoUrl = await getDownloadURL(storageRef);

            const newProgramRef = doc(collection(db, "programs"));
            await setDoc(newProgramRef, {
                id: newProgramRef.id,
                title,
                photoUrl,
                deadline,
                isPinned
            });

            alert('프로그램이 성공적으로 추가되었습니다!');
            window.location.hash = 'programs'; // SPA 방식으로 이동
        } catch (error) {
            console.error("Error adding program:", error);
            alert('프로그램 추가 중 오류가 발생했습니다.');
        }
    });
}

// 이미지 리사이즈
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
export function addnewprogramStyles() {
    const style = document.createElement('style');
    style.id = 'new-program-styles';
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
export function removenewprogram() {
    const style = document.getElementById('new-program-styles');
    if (style) {
        style.remove();
    }
}



