// pages/edit-review-program.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

import { firebaseConfig } from "../firebase.js";

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export function rendereditreviewprogram() {
    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const programId = hashParams.get('id');

    // programId가 유효하지 않을 경우 처리
    if (!programId) {
        console.error("프로그램 ID가 유효하지 않습니다. URL에서 ID를 찾을 수 없습니다.");
        alert("유효하지 않은 프로그램 ID입니다.");
        window.location.hash = 'reviewprograms';
        return;
    }

    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>후기 프로그램 수정</h1>
            <form id="editReviewProgramForm">
                <label for="programTitle">제목:</label>
                <input type="text" id="programTitle" required><br><br>

                <label for="programPhoto">사진:</label>
                <input type="file" id="programPhoto" accept="image/*"><br><br>

                <button type="submit">수정</button>
            </form>
        </div>
    `;

    setupEventListeners(programId); // 프로그램 ID를 setupEventListeners 함수에 전달
    loadProgramDetails(programId); // 프로그램 ID를 loadProgramDetails 함수에 전달
    addeditreviewprogramStyles(); // 스타일 추가
}

// 프로그램 세부 사항을 로드하는 함수
async function loadProgramDetails(programId) {
    try {
        const programDoc = await getDoc(doc(db, "review-programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();
            document.getElementById('programTitle').value = programData.title || '';
            // 기존에 업로드된 사진을 표시하거나 기타 세부 사항을 표시하려면 여기에 추가
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'reviewprograms';
        }
    } catch (error) {
        console.error("프로그램 세부사항을 로드하는 중 오류가 발생했습니다:", error);
        alert("프로그램 세부사항을 로드하는 중 오류가 발생했습니다.");
    }
}

// 이벤트 리스너를 설정하는 함수
function setupEventListeners(programId) {
    document.getElementById('editReviewProgramForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('programTitle').value;
        const photoFile = document.getElementById('programPhoto').files[0];

        try {
            let photoUrl = null;
            if (photoFile) {
                const uniqueFileName = `${Date.now()}_${photoFile.name}`;
                const storageRef = ref(storage, `review-programs/${programId}/${uniqueFileName}`);
                await uploadBytes(storageRef, photoFile);
                photoUrl = await getDownloadURL(storageRef);
            }

            // Firestore에 프로그램 데이터 업데이트
            const programRef = doc(db, "review-programs", programId);
            const updateData = { title };
            if (photoUrl) updateData.photoUrl = photoUrl;

            await updateDoc(programRef, updateData);

            alert('프로그램이 성공적으로 수정되었습니다!');
            window.location.hash = 'reviewprograms'; // 수정 후 세부사항 페이지로 이동
        } catch (error) {
            console.error("프로그램 수정 중 오류가 발생했습니다:", error);
            alert("프로그램 수정 중 오류가 발생했습니다.");
        }
    });
}


// 동적 스타일 추가
export function addeditreviewprogramStyles() {
    const style = document.createElement('style');
    style.id = 'edit-review-program-styles';
    style.textContent = `
        body {
            font-family: 'KoPubDotum Medium'; 
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }

        h1{
        font-family: 'HS산토끼체';
        font-size: 42px;
        line-height: 59px;
        text-align: center;

        color: #6F6F6F; 
        }

        form {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        label {
            font-size: 1.1em;
            color: #007bff;
        }

        input[type="text"],
        input[type="file"] {
            width: 90%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }

        button[type="submit"] {
            width: 100%;
            padding: 10px;
            font-size: 1.2em;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        button[type="submit"]:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeeditreviewprogram() {
    const style = document.getElementById('edit-review-program-styles');
    if (style) {
        style.remove();
    }
}