// pages/review-programs.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let authListenerSet = false; // onAuthStateChanged가 이미 설정되었는지 확인하는 변수

export function renderreviewprograms() {
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>프로그램 후기</h1>
            <p>여기에 완료된 프로그램의 후기를 확인하세요.</p>
            <button id="newReviewProgramButton" style="display:none;">새 후기 프로그램 추가</button>
            <div id="reviewProgramsContainer" class="programs-container">
                <!-- Review Program groups will be displayed here -->
            </div>
        </div>
    `;

    setupEventListeners();
    addreviewprogramsStyles(); // 동적 스타일 추가

    const newReviewProgramButton = document.getElementById('newReviewProgramButton');

    // auth.currentUser에 따라 loadReviewPrograms를 항상 호출
    if (auth.currentUser) {
        if (newReviewProgramButton) {
            newReviewProgramButton.style.display = 'block';
        }
        loadReviewPrograms(true); // 로그인 상태로 프로그램 로드
    } else {
        if (newReviewProgramButton) {
            newReviewProgramButton.style.display = 'none';
        }
        loadReviewPrograms(false); // 비로그인 상태로 프로그램 로드
    }
}

function setupEventListeners() {
    // authListenerSet이 아직 설정되지 않은 경우만 onAuthStateChanged를 설정
    if (!authListenerSet) {
        onAuthStateChanged(auth, user => {
            const newReviewProgramButton = document.getElementById('newReviewProgramButton');

            if (user) {
                console.log("User is logged in");
                if (newReviewProgramButton) {
                    newReviewProgramButton.style.display = 'block';
                }
                renderreviewprograms(); // 로그인 상태로 변경될 때마다 renderreviewprograms 호출
            } else {
                console.log("User is not logged in");
                if (newReviewProgramButton) {
                    newReviewProgramButton.style.display = 'none';
                }
                renderreviewprograms(); // 로그아웃 상태로 변경될 때마다 renderreviewprograms 호출
            }

            // 로그인/로그아웃 버튼 상태 업데이트
            const loginButton = document.getElementById('loginButton');
            const logoutButton = document.getElementById('logoutButton');

            if (loginButton) loginButton.style.display = user ? 'none' : 'block';
            if (logoutButton) logoutButton.style.display = user ? 'block' : 'none';
        });
        authListenerSet = true; // onAuthStateChanged 설정 완료
    }

    const newReviewProgramButton = document.getElementById('newReviewProgramButton');
    if (newReviewProgramButton) {
        newReviewProgramButton.addEventListener('click', () => {
            window.location.hash = 'newreviewprogram';
        });
    }
}

async function loadReviewPrograms(isAuthenticated) {
    const reviewsContainer = document.getElementById('reviewProgramsContainer');
    reviewsContainer.innerHTML = '';

    try {
        const reviewsQuery = query(collection(db, "review-programs"), orderBy("title", "asc"));
        const querySnapshot = await getDocs(reviewsQuery);

        querySnapshot.forEach((doc) => {
            const reviewData = doc.data();
            reviewData.id = doc.id;
            displayReviewProgram(reviewData, reviewsContainer, isAuthenticated);
        });
    } catch (error) {
        console.error("Error loading review programs:", error);
    }
}

function displayReviewProgram(programData, container, isAuthenticated) {
    const programElement = document.createElement('div');
    programElement.classList.add('program-group');

    // 프로그램 이미지 (program-photo)
    const programPhoto = document.createElement('img');
    programPhoto.src = programData.photoUrl || 'placeholder.jpg';
    programPhoto.alt = 'Program photo';
    programPhoto.classList.add('program-photo');
    programPhoto.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${programData.id || 'N/A'}`;
    });
    programElement.appendChild(programPhoto);

    // 프로그램 Wrapper (나머지 요소들을 감쌀 div)
    const programWrapper = document.createElement('div');
    programWrapper.classList.add('program-wrapper');

    // 프로그램 제목 (program-title)
    const programTitle = document.createElement('div');
    programTitle.textContent = programData.title || 'Untitled';
    programTitle.classList.add('program-title');
    programTitle.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${programData.id || 'N/A'}`;
    });
    programWrapper.appendChild(programTitle);

    // 후기 보러가기 버튼 (review-program-apply)
    const reviewButton = document.createElement('button');
    reviewButton.textContent = '후기 보러가기';
    reviewButton.classList.add('review-program-apply');
    reviewButton.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${programData.id || 'N/A'}`;
    });
    programWrapper.appendChild(reviewButton);

    // 프로그램 액션 버튼들 (program-actions)
    if (isAuthenticated) {
        const programActions = document.createElement('div');
        programActions.classList.add('program-actions');

        // 수정 버튼
        const editButton = document.createElement('button');
        editButton.textContent = '수정';
        editButton.addEventListener('click', () => {
            window.location.hash = `editreviewprogram?id=${programData.id || 'N/A'}`;
        });
        programActions.appendChild(editButton);

        // 삭제 버튼
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', async () => {
            await deleteReviewProgram(programData.id || 'N/A', programData.title);
        });
        programActions.appendChild(deleteButton);

        programWrapper.appendChild(programActions); // Actions를 Wrapper에 추가
    }

    // Wrapper를 program-group에 추가
    programElement.appendChild(programWrapper);

    // program-group을 container에 추가
    container.appendChild(programElement);

}

async function deleteReviewProgram(programId, programTitle) {
    if (!programId || typeof programId !== 'string') {
        console.error(`Invalid programId: ${programId}`);
        alert("잘못된 프로그램 ID로 인해 삭제할 수 없습니다.");
        return;
    }

    if (confirm(`정말 ${programTitle}을(를) 삭제하시겠습니까?`)) {
        try {
            const programDoc = await getDoc(doc(db, "review-programs", programId));
            if (!programDoc.exists()) {
                alert("프로그램 데이터를 찾을 수 없어 삭제할 수 없습니다.");
                return;
            }

            const programData = programDoc.data();
            const photoUrl = programData?.photoUrl;

            await deleteDoc(doc(db, "review-programs", programId));

            if (photoUrl) {
                const photoRef = ref(storage, photoUrl);
                await deleteObject(photoRef);
            }

            alert(`${programTitle} 프로그램이 성공적으로 삭제되었습니다.`);
            loadReviewPrograms(true);
        } catch (error) {
            console.error("후기 프로그램 삭제 중 오류가 발생했습니다:", error);
            alert("후기 프로그램 삭제 중 오류가 발생했습니다.");
        }
    }
}





// 동적 스타일 추가
export function addreviewprogramsStyles() {
    const style = document.createElement('style');
    style.id = 'review-programs-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .container {
            max-width: 1300px;
            margin: 50px auto;
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        h1 {
            text-align: center;
            margin-bottom: 20px;
            font-family: 'HS산토끼체';
            font-style: normal;
            font-size: 42px;
            line-height: 59px;
            text-align: center;

            color: #6F6F6F;
        }
        
        p {
            text-align: center;
            margin-bottom: 20px;
            font-family: KoPubDotum Medium;
            font-size: 17px;
            font-weight: 400;
            line-height: 18.7px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #6F6F6F;
        }

        #newReviewProgramButton {
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            display: block;
            margin-left: auto;
            margin-right: auto;
            transition: background-color 0.3s ease;
            font-family: KoPubDotum Medium;
        }

        #newReviewProgramButton:hover {
            background-color: #1E90FF;
        }

         /* .programs-container: 한 줄에 4개씩 배치하고, 넘치면 자동으로 줄바꿈 */
        .programs-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap; /* 줄바꿈 설정 */
        }

        /* .program-group: 한 줄에 4개씩 배치되도록 너비 설정 */
        .program-group {
            width: 310px;
            height: 450px;
            border: 1px solid #ddd;
            padding: 15px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            border-radius: 21px;
            border: 2px solid #77DEEF;
            background-color: #ffffff;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            }
            .program-group:hover {
                transform: translateY(-5px);
        }

        .program-photo {
            width: 210px;
            height: 210px;
            object-fit: cover;
            cursor: pointer;
            border-radius: 10px;
            margin-bottom: 15px;
        }

        .program-title {
            margin-top: 10px;
            margin-bottom: 20px;
            width: 100%;
            text-align: center;
            cursor: pointer;
            text-decoration: none;
                
            font-family: 'KoPubDotum Bold';
            font-style: normal;
            font-weight: 400;
            font-size: 24px;
            line-height: 19px;

            color: #3F3F3F;
        }
        /* review-program-apply 버튼 스타일 */
        .review-program-apply {
            font-family: KoPubDotum Medium;
            padding: 10px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 10px; /* 아래의 버튼들과 간격 */
            width: 250px; /* 원하는 너비로 설정 */
            text-align: center; /* 텍스트를 가운데 정렬 */
        }

        .review-program-apply:hover {
            background-color: #1E90FF;
        }


        /* program-actions 안의 버튼들을 가로 정렬 */
        .program-actions {
            display: flex;
            flex-direction: row; /* 가로로 정렬 */
            justify-content: center; /* 버튼들을 가운데 정렬 */
            align-items: center; /* 세로 방향으로도 가운데 정렬 */
        }

        .program-actions button {
            padding: 5px 10px;
            margin: 5px;
            background-color: #E0F7FA;
            color: #007bff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: KoPubDotum Medium;
        }

        .program-actions button:hover {
            background-color: #1E90FF;
        }

        @media (max-width: 480px) {
            .program-group {
                width: 380px;
                height: 165px;
                border: 1px solid #ddd;
                box-sizing: border-box;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                border-radius: 21px;
                border: 2px solid #77DEEF;
                background-color: #ffffff;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
                gap: 15px;
            }
            
            .program-group:hover {
                    transform: translateY(-5px);
            }
            .program-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .program-photo {
                    width: 130px;
                    height: 130px;
                    max-height: 200px;
                    object-fit: cover;
                    cursor: pointer;
                    border-radius: 10px;
                    margin-bottom: 0px;
            }
            
            .program-title {
                    margin-top: 10px;
                    width: 100%;
                    text-align: center;
                    cursor: pointer;
                    text-decoration: none;
                    
                    font-family: 'KoPubDotum Bold';
                    font-style: normal;
                    font-weight: 400;
                    font-size: 15px;
                    line-height: 19px;
                    color: #3F3F3F;
                }

            .program-title:hover {
                    text-decoration: underline;
            }
            
            .review-program-apply {
                    display: flex;
                    margin-top: 5px;
                    width: 100%;
                    justify-content: center;
                    text-align: center;
                    font-size: 0.01em;
                    font-family: 'KoPubDotum Bold';
                    font-style: normal;
                    color: #00BFFF;
                }
                
            .review-program-apply {
                font-size: 0.01em;
                padding: 10px;
                background-color: #00BFFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 5px;
            }

            .review-program-apply:hover {
                background-color: #1E90FF;
            }
            
            .program-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 15px;
            }

            .program-actions button {
                    padding: 8px 15px;
                    background-color: #E0F7FA;
                    color: #007bff;
                    font-size:10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
            }

            .program-actions button:hover {
                    background-color: #00BFFF;
                    color: white;
            }
        }

    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removereviewprograms() {
    const style = document.getElementById('review-programs-styles');
    if (style) {
        style.remove();
    }
}


















