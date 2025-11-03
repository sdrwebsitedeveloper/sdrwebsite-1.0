// pages/new-review-program.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export function rendernewreviewprogram() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content-container">
            <h1>새 후기 프로그램 추가</h1>
            <form id="newReviewProgramForm">
                <label for="programTitle">제목:</label>
                <input type="text" id="programTitle" required><br><br>

                <label for="programPhoto">사진:</label>
                <input type="file" id="programPhoto" accept="image/*" required><br><br>

                <button type="submit">저장</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addnewreviewprogramStyles(); // 스타일 동적 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('newReviewProgramForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('programTitle').value;
        const file = document.getElementById('programPhoto').files[0];

        try {
            const newProgramRef = doc(collection(db, "review-programs"));
            const programId = newProgramRef.id;

            const uniqueFileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `review-programs/${programId}/${uniqueFileName}`);
            await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(storageRef);

            await setDoc(newProgramRef, {
                id: programId,
                title: title,
                photoUrl: photoUrl,
                reviews: []
            });

            alert('후기 프로그램이 성공적으로 추가되었습니다!');
            window.location.hash = 'reviewprograms';
        } catch (error) {
            console.error("Error adding review program:", error);
            alert('후기 프로그램 추가 중 오류가 발생했습니다.');
        }
    });

}

// 동적 스타일 추가
export function addnewreviewprogramStyles() {
    const style = document.createElement('style');
    style.id = 'new-review-program-styles';
    style.textContent = `
        body {
            font-family: 'KoPubDotum Medium'; 
            background-color: #F0F8FF; /* 밝은 하늘색 */
            margin: 0;
            padding-top: 120px; /* 상단 네비게이션 바 높이 + 여유 공간 */
        }

        .content-container {
            max-width: 800px;
            margin: 80px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            color: #007bff; /* 밝은 푸른색 */
            margin-bottom: 20px;
            font-family: 'HS산토끼체';
        }

        form label {
            font-size: 1.1em;
            color: #007bff;
            display: block;
            margin-top: 15px;
        }

        form input[type="text"],
        form input[type="file"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }

        form button[type="submit"] {
            width: 100%;
            padding: 10px;
            font-size: 1.2em;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        form button[type="submit"]:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewreviewprogram() {
    const style = document.getElementById('new-review-program-styles');
    if (style) {
        style.remove();
    }
}