// pages/post-details.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let postId;
let postData;

export function renderpostdetails(queryString) {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content">
            <h1>공지</h1>
            <div id="postContainer"></div>
            <div class="action-buttons">
                <button id="editButton" style="display: none;">Edit Post</button>
                <button id="deleteButton" style="display: none;">삭제하기</button>
                <button id="backButton">메인으로 돌아가기</button>
            </div>
        </div>
    `;

    setupEventListeners();
    addpostdetailsStyles(); // 동적 스타일 추가

    const urlParams = new URLSearchParams(queryString);
    postId = urlParams.get('id');
    loadPostDetails();
}

// 이벤트 리스너 설정
function setupEventListeners() {

    document.getElementById('deleteButton').addEventListener('click', async () => {
        if (confirm("Are you sure you want to delete this post?")) {
            try {
                if (postData.fileUrls) {
                    await Promise.all(postData.fileUrls.map(async (file) => {
                        const fileRef = ref(storage, file.url);
                        await deleteObject(fileRef);
                    }));
                }

                await deleteDoc(doc(db, "posts", postId));
                alert("Post deleted successfully!");
                window.location.hash = 'dashboard';
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post. Please try again.");
            }
        }
    });

    document.getElementById('backButton').addEventListener('click', () => {
        window.location.hash = 'dashboard';
    });
}

// 게시물 상세 정보 로드
async function loadPostDetails() {
    if (postId) {
        try {
            const postDoc = await getDoc(doc(db, "posts", postId));
            if (postDoc.exists()) {
                postData = postDoc.data();
                const postContainer = document.getElementById('postContainer');

                // 기존 내용을 초기화합니다.
                postContainer.innerHTML = '';
                
                const postTitle = document.createElement('h2');
                postTitle.classList.add('post-title');
                postTitle.textContent = postData.title;
                postContainer.appendChild(postTitle);

                const postContent = document.createElement('p');
                postContent.classList.add('post-content');
                postContent.textContent = postData.content;

                // membersOnly 체크 확인
                if (postData.membersOnly) {
                    onAuthStateChanged(auth, user => {
                        if (user) {
                            postContainer.appendChild(postContent);
                        } else {
                            postContainer.innerHTML = "<p>로그인한 부원만 볼 수 있는 공지사항입니다</p>";
                        }
                    });
                } else {
                    postContainer.appendChild(postContent);
                }

                if (postData.fileUrls) {
                    const fileList = document.createElement('ul');
                    fileList.classList.add('post-files');
                    postData.fileUrls.forEach(file => {
                        const listItem = document.createElement('li');
                        const fileLink = document.createElement('a');
                        fileLink.href = file.url;
                        fileLink.textContent = file.name;
                        fileLink.target = '_blank';
                        listItem.appendChild(fileLink);
                        fileList.appendChild(listItem);
                    });
                    postContainer.appendChild(fileList);
                }

                // 모든 로그인한 사용자가 Edit/Delete 버튼을 볼 수 있도록 설정
                onAuthStateChanged(auth, user => {
                    if (user) {
                        document.getElementById('deleteButton').style.display = 'block';
                    }
                });
            } else {
                alert("Post not found!");
                window.location.hash = 'dashboard';
            }
        } catch (error) {
            console.error("Error loading post details:", error);
            alert("Error loading post details. Please try again.");
            window.location.hash = 'dashboard';
        }
    }
}



// 동적 스타일 추가
export function addpostdetailsStyles() {
    const style = document.createElement('style');
    style.id = 'post-details-styles';
    style.textContent = `
        
    
        body {
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .content {
            font-family: 'HS산토끼체';
            max-width: 900px;
            margin: 80px auto;
            background-color: white;
            padding: 10px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            color: #0f0f0f
        }

        .post-title {
            font-family: 'KoPubDotum Medium'; 
            font-size: 2em;
            margin-bottom: 20px;
        }

        .post-content {
            white-space: pre-wrap; 
            font-family: 'KoPubDotum Medium'; 
            margin-top: 20px;
            font-size: 1.2em;
            line-height: 1.5em;
        }

        .post-files {
            font-family: 'KoPubDotum Medium'; 
            margin-top: 20px;
        }

        .action-buttons {
            margin-top: 20px;
            display: flex;
            gap: 10px;
        }

        .action-buttons button {
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
        }

        .action-buttons button:hover {
            background-color: #1E90FF;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removepostdetails() {
    const style = document.getElementById('post-details-styles');
    if (style) {
        style.remove();
    }
}




