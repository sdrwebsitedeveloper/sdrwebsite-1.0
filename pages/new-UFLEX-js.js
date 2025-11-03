// pages/new-UFLEX.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export function rendernewUFLEX() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>UFLEX 사진 및 설명글 업로드</h1>
            <form id="uploadForm" class="upload-form">
                <input type="file" id="photoInput" accept="image/*" required>
                <textarea id="descriptionInput" placeholder="설명글을 입력하세요" required></textarea>
                <button type="submit">업로드</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addnewUFLEXStyles(); // 스타일 동적 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('uploadForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const file = document.getElementById('photoInput').files[0];
        const description = document.getElementById('descriptionInput').value;

        if (file) {
            try {
                const uniqueFileName = `${Date.now()}_${file.name}`;
                const storageRef = ref(storage, `uflex/${uniqueFileName}`);
                await uploadBytes(storageRef, file);
                const photoUrl = await getDownloadURL(storageRef);

                await setDoc(doc(db, "pages", "uflex"), {
                    imageUrl: photoUrl,
                    description: description
                });

                alert('사진과 설명글이 성공적으로 업로드되었습니다!');
                window.location.hash = 'UFLEX'; // SPA 방식으로 이동
            } catch (error) {
                console.error("업로드 중 오류가 발생했습니다:", error);
                alert('업로드 중 오류가 발생했습니다.');
            }
        }
    });

}

// 동적 스타일 추가
export function addnewUFLEXStyles() {
    const style = document.createElement('style');
    style.id = 'new-UFLEX-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }

        .container {
            max-width: 1080px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .upload-form {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .upload-form input[type="file"] {
            margin-bottom: 20px;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #ddd;
            width: 100%;
            box-sizing: border-box;
        }

        .upload-form textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            border: 1px solid #ddd;
            font-size: 1em;
        }

        .upload-form button {
            padding: 10px 20px;
            font-size: 1.2em;
            cursor: pointer;
            background-color: #00BFFF; 
            color: white;
            border: none;
            border-radius: 20px;
            transition: background-color 0.3s ease;
        }

        .upload-form button:hover {
            background-color: #1E90FF; 
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewUFLEX() {
    const style = document.getElementById('new-UFLEX-styles');
    if (style) {
        style.remove();
    }
}