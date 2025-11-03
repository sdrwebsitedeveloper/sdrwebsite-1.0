// pages/new-post.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, doc, setDoc, collection, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export function rendernewpost() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content-container">
            <h1>Create or Edit Post</h1>
            <form id="postForm">
                <label for="title">Title:</label>
                <input type="text" id="title" required><br><br>

                <label for="content">Content:</label>
                <textarea id="content" rows="5" required></textarea><br><br>

                <label for="fileInput">Files:</label>
                <input type="file" id="fileInput" multiple><br><br>
                <ul id="fileList"></ul><br>

                <label>
                    <input type="checkbox" id="membersOnly"> Only logged-in members can view this post
                </label><br><br>

                <button type="submit">Submit</button>
            </form>
        </div>
    `;

    setupEventListeners();
    addnewpostStyles(); // 스타일 동적 추가
}

// 이벤트 리스너 설정
function setupEventListeners() {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    let uploadedFiles = [];
    let editMode = false;
    let postId = null;

    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('id');

    if (postId) {
        const loadPost = async () => {
            const postDoc = await getDoc(doc(db, "posts", postId));
            if (postDoc.exists()) {
                const postData = postDoc.data();
                document.getElementById('title').value = postData.title;
                document.getElementById('content').value = postData.content;
                document.getElementById('membersOnly').checked = postData.membersOnly || false;
                editMode = true;
            } else {
                alert("Post not found");
                window.location.hash = 'dashboard';
            }
        };
        loadPost();
    }

    fileInput.addEventListener('change', () => {
        fileList.innerHTML = '';
        uploadedFiles = Array.from(fileInput.files);
        uploadedFiles.forEach(file => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            fileList.appendChild(listItem);
        });
    });

    document.getElementById('postForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const isMembersOnly = document.getElementById('membersOnly').checked;
        const fileUrls = [];

        try {
            for (const file of uploadedFiles) {
                const fileRef = ref(storage, `posts/${postId || Date.now()}/${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                fileUrls.push({ url, name: file.name });
            }

            if (editMode) {
                await updateDoc(doc(db, "posts", postId), {
                    title, content, fileUrls, membersOnly: isMembersOnly, timestamp: Date.now()
                });
                alert('Post updated successfully!');
            } else {
                const newPostRef = doc(collection(db, 'posts'));
                postId = newPostRef.id;
                await setDoc(newPostRef, {
                    title, content, fileUrls, membersOnly: isMembersOnly, timestamp: Date.now()
                });
                alert('Post created successfully!');
            }

            window.location.hash = 'dashboard';
        } catch (error) {
            console.error("Error during the file upload and save process:", error);
            alert('An error occurred. Please try again.');
        }
    });
}

// 동적 스타일 추가
export function addnewpostStyles() {
    const style = document.createElement('style');
    style.id = 'new-post-styles';
    style.textContent = `
        body {
            font-family: 'Nunito', sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
        }

        .content-container {
            max-width: 800px;
            margin: 80px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        form label {
            display: block;
            margin-top: 15px;
            font-size: 1.1em;
            color: #333;
        }

        form input[type="text"], form textarea, form input[type="file"], form input[type="checkbox"] {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            border-radius: 5px;
            border: 1px solid #ddd;
            box-sizing: border-box;
        }

        form textarea {
            resize: vertical;
            height: 150px;
        }

        form button[type="submit"] {
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #00BFFF;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            width: 100%;
        }

        form button[type="submit"]:hover {
            background-color: #1E90FF;
        }

        #fileList {
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removenewpost() {
    const style = document.getElementById('new-post-styles');
    if (style) {
        style.remove();
    }
}


