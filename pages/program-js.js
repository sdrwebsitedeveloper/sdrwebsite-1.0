// pages/programs.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let authListenerSet = false; // onAuthStateChanged가 이미 설정되었는지 확인하는 변수

export function renderprograms() {
    console.log("renderprograms 함수 호출됨"); // 확인용 로그

    // 프로그램 UI를 다시 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>진행중인 프로그램</h1>
            <button id="newProgramButton" style="display:none;">새 프로그램 추가</button>
            <div id="programsContainer" class="programs-container">
                <!-- Program groups will be displayed here -->
            </div>
        </div>
    `;

    setupEventListeners();
    addprogramsStyles();

    const newProgramButton = document.getElementById('newProgramButton');

    // auth.currentUser에 따라 loadPrograms를 항상 호출
    if (auth.currentUser) {
        if (newProgramButton) {
            newProgramButton.style.display = 'block';
        }
        loadPrograms(true); // 로그인 상태로 프로그램 로드
    } else {
        if (newProgramButton) {
            newProgramButton.style.display = 'none';
        }
        loadPrograms(false); // 비로그인 상태로 프로그램 로드
    }
}

function setupEventListeners() {
    // authListenerSet이 아직 설정되지 않은 경우만 onAuthStateChanged를 설정
    if (!authListenerSet) {
        onAuthStateChanged(auth, user => {
            const newProgramButton = document.getElementById('newProgramButton');

            if (user) {
                console.log("User is logged in");
                if (newProgramButton) {
                    newProgramButton.style.display = 'block';
                }
                renderprograms(); // 로그인 상태로 변경될 때마다 renderprograms 호출
            } else {
                console.log("User is not logged in");
                if (newProgramButton) {
                    newProgramButton.style.display = 'none';
                }
                renderprograms(); // 로그아웃 상태로 변경될 때마다 renderprograms 호출
            }

            // 로그인/로그아웃 버튼 상태 업데이트
            const loginButton = document.getElementById('loginButton');
            const logoutButton = document.getElementById('logoutButton');

            if (loginButton) loginButton.style.display = user ? 'none' : 'block';
            if (logoutButton) logoutButton.style.display = user ? 'block' : 'none';
        });
        authListenerSet = true; // onAuthStateChanged 설정 완료
    }

    const newProgramButton = document.getElementById('newProgramButton');
    if (newProgramButton) {
        newProgramButton.addEventListener('click', () => {
            window.location.hash = 'newprogram';
        });
    }
}

// 프로그램 불러오기
async function loadPrograms(isAuthenticated) {
    console.log("loadPrograms 함수 호출됨"); // 확인용 로그
    const programsContainer = document.getElementById('programsContainer');
    programsContainer.innerHTML = '';

    try {
        const programsQuery = query(collection(db, "programs"), orderBy("isPinned", "desc"), orderBy("deadline", "asc"));
        const querySnapshot = await getDocs(programsQuery);
        const programs = [];

        querySnapshot.forEach((doc) => {
            const programData = doc.data();
            programData.id = doc.id;
            programs.push(programData);
        });

        const now = new Date();

        for (const programData of programs) {
            const programDeadline = new Date(programData.deadline);

            if (programDeadline <= now) {
                await moveProgramToReview(programData);
            } else {
                displayProgram(programData, programsContainer, isAuthenticated);
            }
        }
    } catch (error) {
        console.error("Error loading programs:", error);
    }
}

// 프로그램 리뷰로 이동
async function moveProgramToReview(programData) {
    try {
        const programId = programData.id;

        if (!programId) {
            console.error("프로그램 ID가 누락되었습니다:", programData);
            alert("프로그램 ID가 누락되어 이동할 수 없습니다.");
            return;
        }

        const reviewProgramRef = doc(db, "review-programs", programId);

        await setDoc(reviewProgramRef, {
            ...programData,
            id: programId,
            reviews: []
        });

        await deleteDoc(doc(db, "programs", programId));

    } catch (error) {
        console.error("Error moving program to review:", error);
        alert("프로그램을 리뷰로 이동하는 중 오류가 발생했습니다.");
    }
}

// 프로그램 표시
function displayProgram(programData, container, isAuthenticated) {
    console.log("displayProgram 호출됨:", programData.id); // 확인용 로그

    // 프로그램이 이미 표시되어 있는지 확인
    if (document.getElementById(`program-${programData.id}`)) {
        console.log(`프로그램 ${programData.id}은 이미 표시되어 있습니다.`);
        return;
    }
    const programElement = document.createElement('div');
    programElement.classList.add('program-group'); // 최상위 div

    // 이미지 요소 생성 및 추가
    const programPhoto = document.createElement('img');
    programPhoto.src = programData.photoUrl || 'placeholder.jpg';
    programPhoto.alt = 'Program photo';
    programPhoto.classList.add('program-photo');
    programPhoto.addEventListener('click', () => {
        window.location.hash = `programdetails?id=${programData.id}`;
    });
    programElement.appendChild(programPhoto); // program-group에 추가

    // Wrapper div 생성
    const programWrapper = document.createElement('div');
    programWrapper.classList.add('wrapper'); // Wrapper 클래스 추가

    // Program Title
    const programTitle = document.createElement('div');
    programTitle.textContent = programData.title;
    programTitle.classList.add('program-title');
    programTitle.addEventListener('click', () => {
        window.location.hash = `programdetails?id=${programData.id}`;
    });
    programWrapper.appendChild(programTitle); // wrapper에 추가

    // Program Time
    const programTime = document.createElement('div');
    programTime.textContent = `남은 시간: ${calculateRemainingTime(programData.deadline)}`;
    programTime.classList.add('program-time');
    programWrapper.appendChild(programTime); // wrapper에 추가

    // Apply Button
    const programApply = document.createElement('button');
    programApply.textContent = '참여하기';
    programApply.classList.add('program-apply');
    programApply.addEventListener('click', () => {
        window.location.hash = `applyprogram?id=${programData.id}`;
    });
    programWrapper.appendChild(programApply); // wrapper에 추가

    // Program Actions (Only if authenticated)
    if (isAuthenticated) {
        const programActions = document.createElement('div');
        programActions.classList.add('program-actions');

        const editButton = document.createElement('button');
        editButton.textContent = '수정';
        editButton.addEventListener('click', () => {
            window.location.hash = `editprogram?id=${programData.id}`;
        });
        programActions.appendChild(editButton); // Actions에 추가

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '삭제';
        deleteButton.addEventListener('click', async () => {
            if (confirm("정말 삭제하시겠습니까?")) {
                await deleteProgram(programData.id, programData.photoUrl);
            }
        });
        programActions.appendChild(deleteButton); // Actions에 추가

        programWrapper.appendChild(programActions); // wrapper에 Actions 추가
    }

    // Wrapper를 program-group에 추가
    programElement.appendChild(programWrapper);

    // 최종적으로 program-group을 container에 추가
    container.appendChild(programElement);

}

// 프로그램 삭제
async function deleteProgram(programId, photoUrl) {
    try {
        await deleteDoc(doc(db, "programs", programId));

        const querySnapshot = await getDocs(collection(db, "programs"));
        let isPhotoUsed = false;
        querySnapshot.forEach((doc) => {
            const programData = doc.data();
            if (programData.photoUrl === photoUrl) {
                isPhotoUsed = true;
            }
        });

        if (!isPhotoUsed) {
            const photoRef = ref(storage, photoUrl);
            await deleteObject(photoRef);
        }

        alert("프로그램이 삭제되었습니다.");
        loadPrograms(true);
    } catch (error) {
        console.error("Error deleting program:", error);
        alert("프로그램 삭제 중 오류가 발생했습니다.");
    }
}

// 남은 시간 계산
function calculateRemainingTime(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff <= 0) {
        return '마감되었습니다.';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${days}일 ${hours}시간 ${minutes}분 남음`;
}

// 동적 스타일 추가
export function addprogramsStyles() {
    const style = document.createElement('style');
    style.id = 'programs-styles';
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
            .container h1{
            font-family: 'HS산토끼체';
            font-size: 42px;
            line-height: 59px;
            text-align: center;

            color: #6F6F6F; 
            }

            .programs-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                justify-content: center;
                margin-bottom: 20px;
                
            }

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
                max-height: 300px;
                object-fit: cover;
                cursor: pointer;
                border-radius: 10px;
                margin-bottom: 15px;
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
                font-size: 24px;
                line-height: 19px;

                color: #3F3F3F;


            }

            .program-title:hover {
                text-decoration: underline;
            }

            .program-time, .program-apply {
                margin-top: 10px;
                width: 100%;
                text-align: center;
                font-size: 1em;
                font-family: 'KoPubDotum Bold';
                font-style: normal;
                color: #00BFFF;
            }

            .program-apply {
                padding: 10px;
                background-color: #00BFFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                margin-top: auto;
            }

            .program-apply:hover {
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
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            .program-actions button:hover {
                background-color: #00BFFF;
                color: white;
            }

            #newProgramButton {
                margin-bottom: 20px;
                padding: 10px 20px;
                background-color: #00BFFF;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1em;
            }

            #newProgramButton:disabled {
                background-color: #87CEEB;
                cursor: not-allowed;
            }
            

            @media (max-width: 480px) {
                .container h1{
                font-family: 'HS산토끼체';
                font-size: 21px;
                line-height: 59px;
                text-align: center;

                color: #6F6F6F; 
                }

                #newProgramButton {
                    margin-bottom: 20px;
                    padding: 10px 20px;
                    background-color: #00BFFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.5em;
                }
                
                .program-group {
                    width: 380px;
                    height: 165px;
                    border: 1px solid #ddd;
                    padding: 15px;
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

                .program-time, .program-apply {
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
                
                .program-apply {
                    font-size: 0.01em;
                    padding: 10px;
                    background-color: #00BFFF;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 5px;
                }

                .program-apply:hover {
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
export function removeprograms() {
    const style = document.getElementById('programs-styles');
    if (style) {
        style.remove();
    }
}


