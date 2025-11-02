// pages/review-details.js

// SPA 환경에서 필요한 Firebase 및 모듈 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, deleteObject, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

let programId;
let isAuthenticated = false;

export function renderreviewdetails() {
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1>프로그램 후기 상세</h1>
            <form id="newPhotoForm" class="new-photo-form" style="display:none;">
                <h2>사진 업로드</h2>
                <input type="file" id="photoInput" accept="image/*" multiple required>
                <button type="submit">사진 업로드</button>
            </form>
            <div id="photosContainer" class="photos-container"></div>
            <div id="reviewsContainer" class="reviews-container"></div>
            <form id="newReviewForm" class="new-review-form" style="display:none;">
                <h2>후기 남기기</h2>
                <label for="nickname">닉네임:</label>
                <input type="text" id="nickname" required>
                <label for="reviewContent">내용:</label>
                <textarea id="reviewContent" rows="4" required></textarea>
                <button type="submit">후기 남기기</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addreviewdetailsStyles(); // 동적 스타일 추가

    // URL 해시를 통해 id를 추출
    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.split('?')[1]);
    programId = hashParams.get('id');

    if (!programId) {
        console.error("프로그램 ID가 유효하지 않습니다.");
        alert("유효하지 않은 프로그램 ID입니다.");
        window.location.hash = 'review-programs';
        return;
    }

    onAuthStateChanged(auth, (user) => {
        isAuthenticated = !!user;
        if (user) {
            document.getElementById('newPhotoForm').style.display = 'block';
            document.getElementById('newReviewForm').style.display = 'block';
        }
        loadReviewDetails();
    });
}

// 후기 내용 로드
async function loadReviewDetails() {
    try {
        const programDoc = await getDoc(doc(db, "review-programs", programId));
        if (programDoc.exists()) {
            const programData = programDoc.data();
            const photosContainer = document.getElementById('photosContainer');
            photosContainer.innerHTML = '';

            // 활동 사진 로드
            const photos = programData.photos || [];
            if (photos.length === 0) {
                photosContainer.innerHTML = '<p>사진 없음</p>';
            } else {
                photos.forEach(photoUrl => {
                    const photoItem = document.createElement('div');
                    photoItem.classList.add('photo-item');

                    const img = document.createElement('img');
                    img.src = photoUrl;

                    const actionsElement = document.createElement('div');
                    actionsElement.classList.add('actions');

                    if (isAuthenticated) {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = '삭제';
                        deleteButton.addEventListener('click', () => deletePhoto(photoUrl));
                        actionsElement.appendChild(deleteButton);
                    }

                    photoItem.appendChild(img);
                    photoItem.appendChild(actionsElement);
                    photosContainer.appendChild(photoItem);
                });
            }

            // 리뷰 로드
            const reviews = programData.reviews || [];
            const reviewsContainer = document.getElementById('reviewsContainer');
            reviewsContainer.innerHTML = '';
            reviews.forEach(review => {
                const reviewItem = document.createElement('div');
                reviewItem.classList.add('review-item');

                const nicknameElement = document.createElement('p');
                nicknameElement.classList.add('nickname');
                nicknameElement.textContent = review.nickname;

                const contentElement = document.createElement('p');
                contentElement.textContent = review.content;

                const actionsElement = document.createElement('div');
                actionsElement.classList.add('actions');

                if (isAuthenticated) {
                    const editButton = document.createElement('button');
                    editButton.textContent = '수정';
                    editButton.addEventListener('click', () => editReview(review));

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = '삭제';
                    deleteButton.addEventListener('click', () => deleteReview(review));

                    actionsElement.appendChild(editButton);
                    actionsElement.appendChild(deleteButton);
                }

                reviewItem.appendChild(nicknameElement);
                reviewItem.appendChild(contentElement);
                reviewItem.appendChild(actionsElement);

                reviewsContainer.appendChild(reviewItem);
            });
        } else {
            alert("프로그램을 찾을 수 없습니다.");
            window.location.hash = 'review-programs';
        }
    } catch (error) {
        console.error("Error loading review details:", error);
        alert("리뷰 세부사항 로드 중 오류가 발생했습니다.");
    }
}

// 사진 업로드 함수 추가
async function uploadPhotos(event) {
    event.preventDefault();

    const fileInput = document.getElementById('photoInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert('사진을 선택해주세요.');
        return;
    }

    try {
        const photoUrls = [];
        for (const file of files) {
            const uniqueFileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(storage, `review-programs/${programId}/${uniqueFileName}`);
            await uploadBytes(storageRef, file);
            const photoUrl = await getDownloadURL(storageRef);
            photoUrls.push(photoUrl);
        }

        await updateDoc(doc(db, "review-programs", programId), {
            photos: arrayUnion(...photoUrls)
        });

        alert('사진들이 성공적으로 업로드되었습니다!');
        loadReviewDetails(); // 업로드 후 세부 사항을 다시 로드하여 업데이트
        document.getElementById('newPhotoForm').reset();
    } catch (error) {
        console.error("Error uploading photos:", error);
        alert('사진 업로드 중 오류가 발생했습니다.');
    }
}


// 기존 MPA 함수들도 함께 추가합니다.
async function deletePhoto(photoUrl) {
    if (confirm("정말 이 사진을 삭제하시겠습니까?")) {
        try {
            const photoRef = ref(storage, photoUrl);
            await deleteObject(photoRef);

            await updateDoc(doc(db, "review-programs", programId), {
                photos: arrayRemove(photoUrl)
            });

            alert("사진이 성공적으로 삭제되었습니다!");
            loadReviewDetails();
        } catch (error) {
            console.error("Error deleting photo:", error);
            alert('사진 삭제 중 오류가 발생했습니다.');
        }
    }
}

async function editReview(review) {
    const newContent = prompt("새로운 리뷰 내용을 입력해주세요.", review.content);
    if (newContent) {
        try {
            await updateDoc(doc(db, "review-programs", programId), {
                reviews: arrayRemove(review)
            });

            const updatedReview = { ...review, content: newContent };
            await updateDoc(doc(db, "review-programs", programId), {
                reviews: arrayUnion(updatedReview)
            });

            alert("리뷰가 성공적으로 수정되었습니다!");
            loadReviewDetails();
        } catch (error) {
            console.error("Error editing review:", error);
            alert('리뷰 수정 중 오류가 발생했습니다.');
        }
    }
}

async function deleteReview(review) {
    if (confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
        try {
            await updateDoc(doc(db, "review-programs", programId), {
                reviews: arrayRemove(review)
            });

            alert("리뷰가 성공적으로 삭제되었습니다!");
            loadReviewDetails();
        } catch (error) {
            console.error("Error deleting review:", error);
            alert('리뷰 삭제 중 오류가 발생했습니다.');
        }
    }
}

function setupEventListeners() {
    document.getElementById('newPhotoForm').addEventListener('submit', uploadPhotos);
    document.getElementById('newReviewForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const nickname = document.getElementById('nickname').value;
        const content = document.getElementById('reviewContent').value;

        const review = { nickname, content };

        try {
            await updateDoc(doc(db, "review-programs", programId), {
                reviews: arrayUnion(review)
            });

            alert('후기가 성공적으로 추가되었습니다!');
            loadReviewDetails();
            document.getElementById('newReviewForm').reset();
        } catch (error) {
            console.error("Error adding review:", error);
            alert('후기 추가 중 오류가 발생했습니다.');
        }
    });
}


// 동적 스타일 추가
export function addreviewdetailsStyles() {
    const style = document.createElement('style');
    style.id = 'review-details-styles';
    style.textContent = `
        body {
            font-family: 'KoPubDotum Medium'; 
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            background-color: white; /* 흰색 */
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

        .photos-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }

        #photoInput {
        background-color: white;       /* 흰색 배경 */
        border: 2px solid #00BFFF;     /* 파란색(#00BFFF) 테두리 */
        border-radius: 4px;            /* 둥근 모서리 (선택 사항) */
        padding: 8px 12px;             /* 보기 좋게 여백 추가 */
        cursor: pointer;               /* 마우스 커서를 포인터로 변경 */
        font-family: Arial, sans-serif;/* 글꼴 설정 */
        width: 100%;                   /* 너비를 100%로 설정 */
        max-width: 1000px;              /* 최대 폭을 900px로 설정 */
        box-sizing: border-box;        /* 패딩과 테두리를 포함하여 크기 계산 *
        }

        #photoInput:hover {
        background-color: #f0f8ff;     /* 호버 시 연한 파란색 배경 */
        }

        .photo-item {
            max-width: 1080px;
            width: 90%;
            height: auto;
            position: relative;
        }

        .photo-item img {
            width: 100%;
            height: auto;
            border-radius: 5px;
        }

        .photo-item .actions {
            position: absolute;
            top: 10px;
            right: 10px;
        }

        .reviews-container {
            margin-top: 20px;
        }

        .review-item {
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
        }

        .review-item p {
            margin: 5px 0;
        }

        .review-item .nickname {
            font-weight: bold;
            color: #007bff;
        }

        .review-item .actions {
            margin-top: 10px;
        }

        .actions button {
            padding: 5px 10px;
            background-color: #00BFFF; /* 하늘색 */
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
        }

        .actions button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }

        .new-review-form, .new-photo-form {
            margin-top: 30px;
            background-color: #F0F8FF;
            padding: 20px;
            border-radius: 10px;
        }

        .new-review-form h2, .new-photo-form h2 {
            color: #007bff; /* 밝은 푸른색 */
        }

        .new-review-form textarea, .new-photo-form input[type="file"] {
            width: 90%;
            padding: 10px;
            margin-top: 10px;
            margin-bottom: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1em;
        }

        .new-review-form button, .new-photo-form button {
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

        .new-review-form button:hover, .new-photo-form button:hover {
            background-color: #1E90FF; /* 더 진한 하늘색 */
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removereviewdetails() {
    const style = document.getElementById('review-details-styles');
    if (style) {
        style.remove();
    }
}