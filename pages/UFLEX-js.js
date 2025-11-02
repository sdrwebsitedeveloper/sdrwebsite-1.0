// pages/UFLEX.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, query, getDocs, orderBy, limit, where, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export function renderUFLEX() {
    document.getElementById('app').innerHTML = `
        <div class="container">
            <div class="image-container">
                <img id="uflexImage" alt="UFLEX Image">
            </div>
            <div id="uflexDescription" class="description">설명글이 여기에 표시됩니다.</div>
            <button id="uploadButton" class="upload-button" style="display:none;">사진 및 설명글 올리기</button>
            <button class="upload-button" onclick="window.location.hash='noticesuflex'">공지사항</button>

            <h2>UFLEX 프로젝트 공지사항</h2>
            <ul id="noticesList" class="notice-list"></ul>

            <div class="uflex-programs">
                <h2>진행중인 UFLEX 프로그램</h2>
                <div id="programsContainer" class="programs-container"></div>
            </div>

            <div class="uflex-reviews">
                <h2>UFLEX 프로그램 활동 후기</h2>
                <div id="reviewsContainer" class="reviews-container"></div>
            </div>
        </div>
    `;

    setupEventListeners();
    addUFLEXStyles(); // 동적 스타일 추가

    loadRecentNotices();
    loadUFLEXContent();
    loadUFLEXPrograms();
    loadUFLEXReviews();
}

function setupEventListeners() {
    onAuthStateChanged(auth, user => {
        if (user) {
            document.getElementById('uploadButton').style.display = 'inline-block';
        }
    });

    document.getElementById('uploadButton').addEventListener('click', () => {
        window.location.hash = 'newUFLEX';
    });
}

async function loadRecentNotices() {
    const noticesList = document.getElementById('noticesList');
    noticesList.innerHTML = '';

    try {
        const q = query(collection(db, "notices"), orderBy("isImportant", "desc"), orderBy("createdAt", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const noticeData = doc.data();
            const li = document.createElement('li');
            li.classList.add('notice-item');

            const a = document.createElement('a');
            a.href = `#noticesdetailsuflex?id=${doc.id}`;
            a.textContent = noticeData.title;

            if (noticeData.isImportant) {
                li.classList.add('important-notice');
            }

            li.appendChild(a);
            noticesList.appendChild(li);
        });
    } catch (error) {
        console.error("UFLEX 공지사항을 불러오는 중 오류가 발생했습니다:", error);
    }
}

async function loadUFLEXContent() {
    try {
        const uflexDoc = await getDoc(doc(db, "pages", "uflex"));
        if (uflexDoc.exists()) {
            const data = uflexDoc.data();
            document.getElementById('uflexImage').src = data.imageUrl || 'placeholder.jpg';
            document.getElementById('uflexDescription').textContent = data.description || '설명글이 아직 등록되지 않았습니다.';
        } else {
            console.error("UFLEX 데이터가 존재하지 않습니다.");
        }
    } catch (error) {
        console.error("UFLEX 데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
}

async function loadUFLEXPrograms() {
    const programsContainer = document.getElementById('programsContainer');
    programsContainer.innerHTML = '';

    try {
        const programsQuery = query(
            collection(db, "programs"),
            where("title", ">=", "uflex"),
            where("title", "<=", "uflex\uf8ff")
        );
        const querySnapshot = await getDocs(programsQuery);

        querySnapshot.forEach((doc) => {
            const programData = doc.data();
            displayProgram({ ...programData, id: doc.id }, programsContainer);
        });
    } catch (error) {
        console.error("UFLEX 프로그램을 불러오는 중 오류가 발생했습니다:", error);
    }
}

async function loadUFLEXReviews() {
    const reviewsContainer = document.getElementById('reviewsContainer');
    reviewsContainer.innerHTML = '';

    try {
        const reviewsQuery = query(
            collection(db, "review-programs"),
            where("title", ">=", "uflex"),
            where("title", "<=", "uflex\uf8ff")
        );
        const querySnapshot = await getDocs(reviewsQuery);

        querySnapshot.forEach((doc) => {
            const reviewData = doc.data();
            displayReview({ ...reviewData, id: doc.id }, reviewsContainer);
        });
    } catch (error) {
        console.error("UFLEX 후기를 불러오는 중 오류가 발생했습니다:", error);
    }
}

function displayProgram(programData, container) {
    const programElement = document.createElement('div');
    programElement.classList.add('program-group'); // 최상위 div

    // 이미지 요소 생성 및 추가
    const programPhoto = document.createElement('img');
    programPhoto.src = programData.photoUrl || 'placeholder.jpg'; // photoUrl이 없는 경우 기본 이미지를 사용
    programPhoto.alt = 'Program photo';
    programPhoto.classList.add('program-photo');
    programPhoto.addEventListener('click', () => {
        window.location.hash = `programdetails?id=${programData.id}`;
    });
    programElement.appendChild(programPhoto); // program-group에 추가

    // Wrapper 생성
    const programWrapper = document.createElement('div');
    programWrapper.classList.add('program-wrapper'); // Wrapper 클래스 추가

    // 프로그램 제목
    const programTitle = document.createElement('div');
    programTitle.textContent = programData.title || 'Untitled';
    programTitle.classList.add('program-title');
    programTitle.addEventListener('click', () => {
        window.location.hash = `programdetails?id=${programData.id}`;
    });
    programWrapper.appendChild(programTitle); // program-wrapper에 추가

    // 마감 시간
    if (programData.deadline) {
        const deadlineElement = document.createElement('div');
        deadlineElement.textContent = calculateTimeRemaining(programData.deadline);
        deadlineElement.classList.add('program-deadline');
        programWrapper.appendChild(deadlineElement); // program-wrapper에 추가
    }

    // 프로그램 액션 버튼들
    const programActions = document.createElement('div');
    programActions.classList.add('program-actions');

    // 참여하기 버튼
    const applyButton = document.createElement('button');
    applyButton.textContent = '참여하기';
    applyButton.classList.add('program-apply');
    applyButton.addEventListener('click', () => {
        window.location.hash = `applyprogram?id=${programData.id}`;
    });
    programActions.appendChild(applyButton); // program-actions에 추가

    programWrapper.appendChild(programActions); // program-wrapper에 program-actions 추가

    // program-wrapper를 program-group에 추가
    programElement.appendChild(programWrapper);

    // program-group을 container에 추가
    container.appendChild(programElement);

}


function displayReview(reviewData, container) {
    const reviewElement = document.createElement('div');
    reviewElement.classList.add('review-group'); // 최상위 div

    // 후기 이미지 (review-photo)
    const reviewPhoto = document.createElement('img');
    reviewPhoto.src = reviewData.photoUrl || 'placeholder.jpg';
    reviewPhoto.alt = 'Review photo';
    reviewPhoto.classList.add('review-photo');
    reviewPhoto.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${reviewData.id}`;
    });
    reviewElement.appendChild(reviewPhoto); // review-group에 추가

    // Wrapper 생성
    const reviewWrapper = document.createElement('div');
    reviewWrapper.classList.add('review-wrapper'); // Wrapper 클래스 추가

    // 후기 제목 (review-title)
    const reviewTitle = document.createElement('div');
    reviewTitle.textContent = reviewData.title || 'Untitled';
    reviewTitle.classList.add('review-title');
    reviewTitle.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${reviewData.id}`;
    });
    reviewWrapper.appendChild(reviewTitle); // review-wrapper에 추가

    // 후기 액션 버튼들 (review-actions)
    const reviewActions = document.createElement('div');
    reviewActions.classList.add('review-actions');

    // 후기 보러가기 버튼
    const reviewButton = document.createElement('button');
    reviewButton.textContent = '후기 보러가기';
    reviewButton.classList.add('review-button');
    reviewButton.addEventListener('click', () => {
        window.location.hash = `reviewdetails?id=${reviewData.id}`;
    });
    reviewActions.appendChild(reviewButton); // review-actions에 추가

    reviewWrapper.appendChild(reviewActions); // review-wrapper에 review-actions 추가

    // review-wrapper를 review-group에 추가
    reviewElement.appendChild(reviewWrapper);

    // review-group을 container에 추가
    container.appendChild(reviewElement);

}

// 남은 시간 계산 함수
function calculateTimeRemaining(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;

    if (timeDiff <= 0) {
        return "마감되었습니다.";
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}일 ${hours}시간 ${minutes}분 남았습니다.`;
}

// 동적 스타일 추가
export function addUFLEXStyles() {
    const style = document.createElement('style');
    style.id = 'UFLEX-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }
        .container {
            max-width: 1080px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background-color: white; /* 흰색 */
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .image-container {
            width: 100%;
            height: 0;
            padding-bottom: 50%; /* 2:1 비율 유지 */
            position: relative;
        }

        .image-container img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
        }

        .description {
            margin-top: 20px;
            font-size: 1.2em;
            line-height: 1.6;
        }

        .upload-button {
            margin-top: 20px;
            padding: 10px 20px;
            font-size: 1em;
            cursor: pointer;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 20px;
            display: inline-block; /* 기본적으로 버튼이 보이도록 수정 */
            transition: background-color 0.3s ease;
        }

        .upload-button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }
        
        h2{
            font-family: HS산토끼체;
            font-size: 42px;
            font-weight: 300;
            line-height: 58.8px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #6F6F6F;
        }

        .uflex-programs, .uflex-reviews {
            margin-top: 40px;
        }

        .uflex-programs h2, .uflex-reviews h2 {
            margin-bottom: 20px;
            color: #6F6F6F;
        }

        .programs-container, .reviews-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }

        .program-group, .review-group {
            width: 310px;
            height: 390px;
            border: 2px solid #77DEEF;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            background-color: white; /* 흰색 */
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .program-group:hover, .review-group:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
        .program-wrapper, .review-wrapper {
            display: flex; 
            flex-direction: column; 
            justify-content: center;
            align-items: center;
            gap: 10px; 
            box-sizing: border-box; 
        }


        .program-photo, .review-photo {
            width: 210px;
            height: 210px;
            object-fit: cover;
            cursor: pointer;
            border-radius: 5px;
        }

        .program-title, .review-title {
            margin-top: 10px;
            width: 100%;
            text-align: center;
            font-size: 1.2em;
            cursor: pointer;
            color: #3F3F3F; /* 밝은 푸른색 */
            text-decoration: none;
        }

        .program-title:hover, .review-title:hover {
            text-decoration: underline;
        }

        .program-deadline {
            font-size: 0.9em;
            color: #00BFFF;
            margin-top: 10px;
            margin-bottom: 10px;
        }

        .program-actions, .review-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
            position: absolute;
            bottom: 10px;
            justify-content: center;
        }

        .program-apply, .review-button {
            padding: 8px 16px;
            font-size: 1em;
            cursor: pointer;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }

        .program-apply:hover, .review-button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }

        .notice-list {
            display: flex;
            flex-direction: column;    
            align-items: center;           
            justify-content: center;     
            height: 100%;                  
            list-style: none;
            padding: 0;
            margin: 20px 0;
            border: 2px solid #77DEEF;
            border-radius: 21px;
        }

        .notice-item {
            display: flex;
            width: 90%;
            padding: 20px;
            border-bottom: 2px solid #77DEEF;
        }

        .notice-item a {
            text-decoration: none;
            color: #333;
            font-size: 1.2em;
        }

        .notice-item a:hover {
            text-decoration: underline;
        }

        .important-notice {
            font-weight: bold;
            color: red;
        }
        
        @media (max-width: 480px) {
            .image-container {
            width: 100%;
            height: 0;
            padding-bottom: 50%; /* 2:1 비율 유지 */
            position: relative;
            }

            .image-container img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 10px;
            }
            
            h2{
                font-family: HS산토끼체;
                font-size: 21px;
                font-weight: 300;
                line-height: 58.8px;
                text-align: center;
                text-underline-position: from-font;
                text-decoration-skip-ink: none;
                color: #6F6F6F;
            }
            
            .upload-button {
            margin-top: 10px;
            padding: 5px 10px;
            font-size: 0.5em;
            cursor: pointer;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 20px;
            display: inline-block; /* 기본적으로 버튼이 보이도록 수정 */
            transition: background-color 0.3s ease;
        }
        
            .notice-list {
                display: flex;
                flex-direction: column;    
                align-items: center;           
                justify-content: center;     
                height: 60%;                  
                list-style: none;
                padding: 0;
                margin: 10px 0;
                border: 2px solid #77DEEF;
                border-radius: 21px;
            }

            .notice-item {
                display: flex;
                width: 85%;
                padding: 10px;
                border-bottom: 2px solid #77DEEF;
            }

            .notice-item a {
                text-decoration: none;
                color: #333;
                font-size: 0.5em;
            }

            .notice-item a:hover {
                text-decoration: underline;
            }

            .important-notice {
                font-weight: bold;
                color: red;
            }
            
            .program-group,.review-group {
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
                
            .program-wrapper,.review-wrapper {
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .program-photo,.review-photo {
                width: 130px;
                height: 130px;
                max-height: 200px;
                object-fit: cover;
                cursor: pointer;
                border-radius: 10px;
                margin-bottom: 0px;
                }

            .program-title,.review-title {
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
            
            .program-deadline {
                font-size: 0.45em;
                color: #00BFFF;
                margin-top: 10px;
                margin-bottom: 10px;
            }
            
            .program-apply, .review-button {
                padding: 4px 8px;
                font-size: 0.5em;
                cursor: pointer;
                background-color: #00BFFF; /* 하늘색 */
                color: white;
                border: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
            }

            .program-apply:hover, .review-button:hover {
                background-color: #1E90FF; /* 더 진한 하늘색 */
            }
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeUFLEX() {
    const style = document.getElementById('UFLEX-styles');
    if (style) {
        style.remove();
    }
}