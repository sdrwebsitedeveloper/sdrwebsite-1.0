// pages/program-details.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let programId;

export function renderprogramdetails() {
    console.log("renderprogramdetails 함수 호출됨"); // 확인용 로그
    document.getElementById('app').innerHTML = `
        <div class="program-container">
            <div id="programPhotoContainer" class="no-photo">사진 없음</div>
            <div id="programDescription" class="program-description"></div>
            <div class="program-actions">
                <button id="editDetailsButton" style="display:none;">사진 및 문구 수정</button>
                <button id="deletePhotoButton" style="display:none;">사진 및 문구 삭제</button>
            </div>

            <div class="back-button">
                <button id="applyButton">신청하기</button>
            </div>
            <div class="back-button">
                <button onclick="window.location.hash='programs'">프로그램 목록으로 돌아가기</button>
            </div>
        </div>
    `;

    setupEventListeners();
    addprogramdetailsStyles(); // 동적 스타일 추가

    // URLSearchParams를 통해 id 파라미터 추출
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    programId = urlParams.get('id');

    // programId가 없을 경우 처리
    if (!programId) {
        console.error("Program ID is missing");
        alert("프로그램 ID를 찾을 수 없습니다.");
        window.location.hash = 'programs';
        return;
    }

    loadProgramDetails();
}


// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('applyButton').addEventListener('click', () => {
        window.location.hash = `applyprogram?id=${programId}`;
    });

    onAuthStateChanged(auth, user => {
        if (user) {
            const editDetailsButton = document.getElementById('editDetailsButton');
            const deletePhotoButton = document.getElementById('deletePhotoButton');

            if (editDetailsButton) {
                editDetailsButton.style.display = 'inline-block';
                editDetailsButton.addEventListener('click', () => {
                    window.location.hash = `editprogramdetails?id=${programId}`;
                });
            }

            if (deletePhotoButton) {
                deletePhotoButton.style.display = 'inline-block';
            }

            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'block';
        }
    });
}


// 프로그램 세부 사항 로드
async function loadProgramDetails() {
    try {
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

        const programDoc = await getDoc(doc(db, "programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();
            const photoContainer = document.getElementById('programPhotoContainer');
            if (programData.detailPhotoUrl) {
                photoContainer.innerHTML = `<img src="${programData.detailPhotoUrl}" class="program-photo" alt="Program photo">`;
                photoContainer.classList.remove('no-photo');
            } else {
                photoContainer.textContent = '사진 없음';
                photoContainer.classList.add('no-photo');
            }
            document.getElementById('programDescription').textContent = programData.detailDescription || '';

            // 수정 버튼 이벤트 리스너 추가 (SPA 방식)
            const editDetailsButton = document.getElementById('editDetailsButton');
            if (editDetailsButton) {
                editDetailsButton.addEventListener('click', () => {
                    window.location.hash = `editprogramdetails?id=${programId}`; // SPA 방식으로 해시 변경
                });
            }

            // 사진 삭제 버튼 이벤트 리스너 추가
            const deletePhotoButton = document.getElementById('deletePhotoButton');
            if (deletePhotoButton) {
                deletePhotoButton.addEventListener('click', async () => {
                    if (confirm("정말 사진 및 소개 문구를 삭제하시겠습니까?")) {
                        await deletePhotoAndDescription(programId, programData.detailPhotoUrl);
                    }
                });
            }

            // 인증 상태에 따라 버튼 표시 제어 (SPA 방식)
            onAuthStateChanged(auth, user => {
                if (user) {
                    if (editDetailsButton) editDetailsButton.style.display = 'inline-block';
                    if (deletePhotoButton) deletePhotoButton.style.display = 'inline-block';
                    document.getElementById('loginButton').style.display = 'none';
                    document.getElementById('logoutButton').style.display = 'block';
                }
            });
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'programs'; // 프로그램 목록 페이지로 이동
        }
    } catch (error) {
        console.error("프로그램 세부 사항을 로드하는 중 오류가 발생했습니다:", error);
        alert("프로그램 세부 사항을 로드하는 중 오류가 발생했습니다.");
    }
}

// 사진 및 소개 문구 삭제 함수
async function deletePhotoAndDescription(programId, photoUrl) {
    try {
        if (photoUrl) {
            const photoRef = ref(storage, photoUrl);
            await deleteObject(photoRef);
        }

        await updateDoc(doc(db, "programs", programId), {
            detailPhotoUrl: "",
            detailDescription: ""
        });

        const photoContainer = document.getElementById('programPhotoContainer');
        if (photoContainer) {
            photoContainer.textContent = '사진 없음';
            photoContainer.classList.add('no-photo');
        }
        document.getElementById('programDescription').textContent = '';

        alert("사진 및 소개 문구가 삭제되었습니다.");
    } catch (error) {
        console.error("사진 및 소개 문구 삭제 중 오류가 발생했습니다.", error);
        alert("사진 및 소개 문구 삭제 중 오류가 발생했습니다.");
    }
}


// 동적 스타일 추가
export function addprogramdetailsStyles() {
    const style = document.createElement('style');
    style.id = 'program-details-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .program-container {
            max-width: 900px;
            margin: 50px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .program-photo {
            width: 100%;
            max-width: 900px;
            height: auto;
            border-radius: 10px;
        }

        .no-photo {
            width: 100%;
            max-width: 900px;
            height: 300px;
            font-size: 24px;
            color: #ccc;
            border: 1px dashed #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
        }

        .program-description {
            margin-top: 20px;
        }

        .program-actions {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            gap: 10px;
        }

        .program-actions button {
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }

        .program-actions button:hover {
            background-color: #1E90FF;
        }

        .back-button {
            margin-top: 20px;
            text-align: center;
        }

        .back-button button {
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }

        .back-button button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeprogramdetails() {
    const style = document.getElementById('program-details-styles');
    if (style) {
        style.remove();
    }
}