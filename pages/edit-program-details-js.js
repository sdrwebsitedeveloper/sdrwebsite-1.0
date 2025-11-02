// pages/edit-program-details.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export function rendereditprogramdetails() {
    console.log("rendereditprogramdetails 함수 호출됨"); // 확인용 로그

    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="program-container">
            <h2>사진 및 문구 수정</h2>
            <form id="detailForm">
                <label for="detailPhoto">사진:</label>
                <input type="file" id="detailPhoto" accept="image/*"><br><br>
                <label for="detailDescription">소개:</label>
                <textarea id="detailDescription" rows="5"></textarea><br><br>
                <button type="submit">저장</button>
            </form>
        </div>
    `;

    setupEventListeners();
    loadProgramDetails();
    addeditprogramdetailsStyles(); // 스타일 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const programId = hashParams.get('id');

    if (!programId) {
        console.error("Program ID is missing");
        alert("프로그램 ID를 찾을 수 없습니다.");
        window.location.hash = 'programs';
        return;
    }

    document.getElementById('detailForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const file = document.getElementById('detailPhoto').files[0];
        const description = document.getElementById('detailDescription').value;

        try {
            let photoUrl;
            if (file) {
                const uniqueFileName = `${Date.now()}_${file.name}`;
                const resizedImage = await resizeImage(file, 900, 900);
                const storageRef = ref(storage, `program-details/${uniqueFileName}`);
                await uploadBytes(storageRef, resizedImage);
                photoUrl = await getDownloadURL(storageRef);
            }

            const programData = { detailDescription: description };
            if (photoUrl) {
                programData.detailPhotoUrl = photoUrl;
            }

            await updateDoc(doc(db, "programs", programId), programData);

            alert('프로그램 상세 내용이 성공적으로 수정되었습니다!');
            window.location.hash = `programdetails?id=${programId}`;
        } catch (error) {
            console.error("프로그램 상세 내용 수정 중 오류가 발생했습니다.", error);
            alert('프로그램 상세 내용 수정 중 오류가 발생했습니다.');
        }
    });
}

// 프로그램 세부사항 로드
async function loadProgramDetails() {
    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    const programId = hashParams.get('id');

    // programId가 유효하지 않을 경우 처리
    if (!programId) {
        console.error("Program ID is missing");
        alert("프로그램 ID를 찾을 수 없습니다.");
        window.location.hash = 'programs';
        return;
    }

    try {
        const programDoc = await getDoc(doc(db, "programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();
            document.getElementById('detailDescription').value = programData.detailDescription || '';
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'programs';
        }
    } catch (error) {
        console.error("프로그램 세부 사항을 로드하는 중 오류가 발생했습니다.", error);
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
                const ratio = img.width / img.height;
                if (img.width > maxWidth) {
                    canvas.width = maxWidth;
                    canvas.height = maxWidth / ratio;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, file.type);
            };
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 동적 스타일 추가
export function addeditprogramdetailsStyles() {
    const style = document.createElement('style');
    style.id = 'edit-program-details-styles';
    style.textContent = `
        body {
            font-family: 'KoPubDotum Medium'; 
            background-color: #F0F8FF; 
            margin: 0;
            padding-top: 120px;
        }
        
        .program-container {
            max-width: 900px;
            margin: 0 auto;
            text-align: center;
            background-color: white; 
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        /* 파일 입력 스타일 */
        #detailForm input[type="file"] {
            background-color: #ffffff; 
            border: 2px solid #77DEEF; 
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 14px;
            color: #77DEEF;
            cursor: pointer;
            transition: border-color 0.3s, color 0.3s;
        }

        #detailForm input[type="file"]::file-selector-button {
            background-color: #77DEEF; 
            color: #ffffff; 
            border: none; 
            padding: 5px 10px; 
            border-radius: 5px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        #detailForm input[type="file"]::file-selector-button:hover {
            background-color: #5bc4d6; /* 호버 시 약간 어두운 색상 */
        }

        #detailForm {
            background-color: #ffffff; /* 흰색 배경 */
            border: 2px solid #77DEEF; /* 테두리 색상 */
            padding: 20px; /* 내부 여백 */
            border-radius: 8px; /* 모서리 둥글게 */
            max-width: 400px; /* 최대 너비 */
            margin: 0 auto; /* 가운데 정렬 */
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
        }

        /* 라벨 스타일 */
        #detailForm label {
            font-weight: bold; /* 굵은 글씨 */
            color: #77DEEF; /* 텍스트 색상 */
        }


        /* 텍스트 영역 스타일 */
        #detailForm textarea {
            background-color: #ffffff;
            border: 2px solid #77DEEF;
            padding: 10px; 
            border-radius: 5px; 
            font-size: 14px;
            width: 100%;
            box-sizing: border-box; 
            resize: vertical; 
            transition: border-color 0.3s; 
        }

        #detailForm textarea:focus {
            border-color: #5bc4d6;
            outline: none;
        }


        
        #detailForm button[type="submit"] {
            background-color: #77DEEF; 
            color: #ffffff; 
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer; 
            transition: background-color 0.3s; 
        }

        #detailForm button[type="submit"]:hover {
            background-color: #5bc4d6;
        }

    `;
    document.head.appendChild(style);
}

// 스타일 동적 제거
export function removeeditprogramdetails() {
    const style = document.getElementById('edit-program-details-styles');
    if (style) {
        style.remove();
    }
}