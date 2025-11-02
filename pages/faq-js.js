// pages/faq.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, onValue, child, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

import { firebaseConfig } from "../firebase.js";

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export function renderfaq() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div id="embed", style="display: flex;">
            <a href="https://pf.kakao.com/_YZYgG" 
            target="_blank" 
            rel="noopener noreferrer" 
            role="link" 
            style="
                display: flex; 
                color: inherit; 
                text-decoration: none; 
                user-select: none; 
                transition: background 20ms ease-in; 
                cursor: pointer; 
                flex-grow: 1; 
                min-width: 0px; 
                flex-wrap: wrap-reverse; 
                align-items: stretch; 
                text-align: left; 
                overflow: hidden; 
                border: 1px solid rgba(55, 53, 47, 0.16); 
                border-radius: 4px; 
                position: relative; 
                fill: inherit;">
            
                <!-- 왼쪽 텍스트 컨테이너 -->
                <div style="flex: 4 1 180px; padding: 12px 14px 14px; overflow: hidden; text-align: left;">
                    <div style="
                        font-size: 14px; 
                        line-height: 20px; 
                        color: rgb(55, 53, 47); 
                        white-space: nowrap; 
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                        min-height: 24px; 
                        margin-bottom: 2px;">
                        선뚜리 챗봇
                    </div>
                    <div style="
                        font-size: 12px; 
                        line-height: 16px; 
                        color: rgba(55, 53, 47, 0.65); 
                        height: 32px; 
                        overflow: hidden;">
                        FAQ게시판에서 자유롭게 문의하시고 상세한 문의를 원하신다면 아래 링크를 통해 선뚜리 챗봇을 이용해 주세요!
                    </div>
                    <div style="display: flex; margin-top: 6px;">
                        <div style="
                            font-size: 12px; 
                            line-height: 16px; 
                            color: rgb(55, 53, 47); 
                            white-space: nowrap; 
                            overflow: hidden; 
                            text-overflow: ellipsis;">
                            https://pf.kakao.com/_YZYgG
                        </div>
                    </div>
                </div>

                <!-- 오른쪽 이미지 컨테이너 -->
                <div style="flex: 1 1 180px; display: block; position: relative;">
                    <div style="position: absolute; inset: 0px;">
                        <div style="width: 100%; height: 100%;">
                            <img src="/assets/images/챗봇.jpg" 
                            referrerpolicy="same-origin" 
                            style="display: block; object-fit: cover; border-radius: 2px; width: 100%; height: 100%;">
                            </img>
                        </div>
                    </div>
                </div>
            </a>
        </div>

        <h1>FAQ 목록</h1>
        <div class="search-container">
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="검색어를 입력하세요">
                <button onclick="searchFaq()">
                    <span class="icon-search"></span>
                </button>
            </div>
        </div>


        <div class="container">
            <button id="upload" onclick="window.location.hash='newfaq'">문의하기</button>
            <ul id="faqList">
            </ul>
        </div>

        <!-- 페이지네이션 컨테이너 -->
        <div class="pagination" id="pagination"></div>
    `;
    
    loadFaqData();
    addfaqStyles(); // 스타일 추가
}

// FAQ 데이터 로드
function loadFaqData() {
    const faqList = document.getElementById('faqList');
    const paginationDiv = document.getElementById('pagination');
    const faqsRef = ref(database, 'faqs');
    let allFaqs = [];
    const itemsPerPage = 8;
    let currentPage = 1;

    onValue(faqsRef, async (snapshot) => {
        faqList.innerHTML = '';
        paginationDiv.innerHTML = '';
        allFaqs = [];
        const promises = [];

        snapshot.forEach((childSnapshot) => {
            const faq = childSnapshot.val();
            faq.id = childSnapshot.key;
            allFaqs.push(faq);

            const commentsRef = ref(database, `faqs/${faq.id}/comments`);
            const commentsPromise = get(commentsRef).then((commentsSnapshot) => {
                if (commentsSnapshot.exists()) {
                    faq.answered = true;
                }
            });
            promises.push(commentsPromise);
        });

        await Promise.all(promises);
        displayPage(1);
        setupPagination(allFaqs, itemsPerPage);
    });
    

function displayPage(page) {
        faqList.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedFaqs = allFaqs.slice(start, end);

        paginatedFaqs.forEach(faq => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="#faqdetails?id=${faq.id}">${faq.title}</a>`;
            if (faq.answered) {
                const answeredSpan = document.createElement('span');
                answeredSpan.textContent = " (답변 완료)";
                answeredSpan.className = "answered";
                li.appendChild(answeredSpan);
            }
            faqList.appendChild(li);
        });
    }

    function setupPagination() {
        const pageCount = Math.ceil(allFaqs.length / itemsPerPage);
        paginationDiv.innerHTML = '';

        // '처음으로' 버튼
        const firstButton = document.createElement('button');
        firstButton.textContent = '<<';
        firstButton.onclick = () => {
            currentPage = 1;
            displayPage(currentPage);
            updatePagination();
        };
        paginationDiv.appendChild(firstButton);

        // '이전' 버튼
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayPage(currentPage);
                updatePagination();
            }
        };
        paginationDiv.appendChild(prevButton);

        // 페이지 번호 버튼
        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            if (i === currentPage) button.classList.add('active');
            button.addEventListener('click', () => {
                currentPage = i;
                displayPage(i);
                updatePagination();
            });
            paginationDiv.appendChild(button);
        }

        
            // '다음' 버튼
            const nextButton = document.createElement('button');
            nextButton.textContent = '>';
            nextButton.onclick = () => {
                if (currentPage < pageCount) {
                    currentPage++;
                    displayPage(currentPage);
                    updatePagination();
                }
            };
            paginationDiv.appendChild(nextButton);

            // '마지막으로' 버튼
            const lastButton = document.createElement('button');
            lastButton.textContent = '>>';
            lastButton.onclick = () => {
                currentPage = pageCount;
                displayPage(currentPage);
                updatePagination();
            };
            paginationDiv.appendChild(lastButton);

        
    }

    // 페이지네이션 업데이트
    function updatePagination() {
        const buttons = paginationDiv.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.textContent) === currentPage) {
                button.classList.add('active');
            }
        });
    }
    // 검색 기능 및 기타 나머지 코드 유지

        // 검색 기능
        window.searchFaq = function() {
            const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
            faqList.innerHTML = '';
            paginationDiv.innerHTML = '';

            const filteredFaqs = allFaqs.filter(faq => {
                const title = faq.title.toLowerCase();
                return title.includes(searchTerm) || fuzzySearch(searchTerm, title);
            });

            if (filteredFaqs.length > 0) {
                allFaqs = filteredFaqs;
                displayPage(1);
                setupPagination();
            } else {
                faqList.innerHTML = '<li>검색 결과가 없습니다.</li>';
            }
        };

        // 간단한 초성 검색 및 유사 검색 구현
        function fuzzySearch(needle, haystack) {
            const needleChars = needle.split('');
            const haystackChars = haystack.split('');
            let index = 0;
            return needleChars.every(char => {
                index = haystackChars.indexOf(char, index);
                return index !== -1;
            });
        }

}

function isEmbedMode() {
    // 1. 쿼리 파라미터로 embed 상태 확인
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('embed') === 'true') {
        return true;
    }

    // 2. 해시로 embed 상태 확인
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    if (hashParams.get('embed') === 'true') {
        return true;
    }

    // 3. iframe 임베드 여부 확인
    if (window.self !== window.top) {
        console.log('임베드 상태: iframe 안에서 실행 중');
        return true;
    }

    // 4. 기본 상태 (임베드 아님)
    return false;
}

function handleEmbedMode() {
    const isEmbed = isEmbedMode();
    const embed = document.getElementById('embed');

    if (isEmbedMode()) {
        document.body.classList.add('embed-mode');
    } else {
        document.body.classList.remove('embed-mode');
    }

    if (isEmbed) {
        console.log('임베드 상태입니다. 네비게이션 바를 숨깁니다.');
        document.body.classList.add('embed-mode');
        if (embed) {
            embed.style.display = 'none'; // 숨기기
            const style = document.createElement('style');
            style.innerHTML = `
                body {
                    font-family: KoPubDotum Medium, sans-serif;
                    background-color: #F0F8FF;
                    margin: 0;
                    padding-top: 0px;
                }

                h1 {
                    font-family: HS산토끼체;
                    font-size: 42px;
                    font-weight: 400;
                    line-height: 58.8px;
                    text-align: center;
                    text-underline-position: from-font;
                    text-decoration-skip-ink: none;
                    color: #6F6F6F;


                }

                .content {
                    max-width: 1200px;
                    margin: 10px auto;
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .pagination {
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                }

                .pagination button {
                    margin: 5px;
                    padding: 5px 10px;
                    font-size: 1.2em;
                    color: #FFFFFF;
                    cursor: pointer;
                    background-color: #E9E9E9;
                    border: 3px;
                    border-radius: 30px;
                }

                .pagination button.active {
                    font-weight: bold;
                    background-color: #ddd;
                }

                .answered {
                    color: green;
                    font-weight: bold;
                }
                
                .search-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    
                }
                
                .search-bar {
                    display: flex;
                    align-items: center;
                    border: 2px solid #77DEEF;
                    border-radius: 30px;
                    padding: 5px;
                    width: 900px;              
                    box-sizing: border-box;
                }

                
                #searchInput {
                    flex: 1;                   
                    border: none;              
                    outline: none;             
                    font-size: 16px;
                    border-radius: 30px 0 0 30px; 
                }

                
                .search-bar button {
                    background-color: #77DEEF;
                    border: none;              
                    padding: 15px 20px;
                    border-radius: 30px; 
                    cursor: pointer;           
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                
                .icon-search {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background-color: white;
                    -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>') no-repeat center;
                    mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>') no-repeat center;
                    mask-size: contain;
                }
                
                #upload {
                    align-self: flex-end;
                    margin-top: 20px;
                    margin-right: 150px;
                    width: 112px;
                    height: 35px;
                    gap: 0px;
                    border: none;
                    border-radius: 10px 10px 0px 0px;
                    opacity: 0px;
                    cursor: pointer;

                }
                
                .container {
                    display: flex;
                    flex-direction: column; /* 세로 방향으로 정렬 */
                    gap: 10px;              /* 버튼과 리스트 사이의 간격 */
                }

                #faqList{
                    display: flex;
                    flex-direction: column;
                    list-style: none;
                    padding: 0 13%;           
                    margin-top: 20px;
                    width: 100%;
                    box-sizing: border-box;
                }

                #faqList li{
                padding-top: 15px;
                border-bottom: 1px solid #ddd;
                text-align: left;
                }

                #faqList li a{
                text-decoration: none;
                color: #333;
                font-size: 1.2em;
                }
            `;
        document.head.appendChild(style); // <head>에 삽입
        } else {
            console.error('요소를 찾을 수 없습니다!');
        }
    } else {
        console.log('일반 상태입니다.');
        document.body.classList.remove('embed-mode');
        if (embed) {
            embed.style.display = 'flex'; // 다시 표시
        }
    }
}
window.addEventListener('popstate', handleEmbedMode);

// DOMContentLoaded 이벤트에서 실행
document.addEventListener('DOMContentLoaded', () => {
    handleEmbedMode();
});

function resetStyles() {
    const element = document.getElementById('embed');
    element.removeAttribute('style'); // 모든 인라인 스타일 제거
    console.log('임베드 상태 스타일 초기화');
}

window.addEventListener('DOMContentLoaded', resetStyles);
window.addEventListener('popstate', resetStyles);

// 동적 스타일 추가
export function addfaqStyles() {
    const style = document.createElement('style');
    style.id = 'faq-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium, sans-serif;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 180px;
        }

        h1 {
            font-family: HS산토끼체;
            font-size: 42px;
            font-weight: 400;
            line-height: 58.8px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #6F6F6F;


        }

        .content {
            max-width: 1200px;
            margin: 10px auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 20px;
        }

        .pagination button {
            margin: 5px;
            padding: 5px 10px;
            font-size: 1.2em;
            color: #FFFFFF;
            cursor: pointer;
            background-color: #E9E9E9;
            border: 3px;
            border-radius: 30px;
        }

        .pagination button.active {
            font-weight: bold;
            background-color: #ddd;
        }

        .answered {
            color: green;
            font-weight: bold;
        }
        
        .search-container {
            display: flex;
            justify-content: center;
            align-items: center;
            
        }
        
        .search-bar {
            display: flex;
            align-items: center;
            border: 2px solid #77DEEF;
            border-radius: 30px;
            padding: 5px;
            width: 900px;              
            box-sizing: border-box;
        }

        
        #searchInput {
            flex: 1;                   
            border: none;              
            outline: none;             
            font-size: 16px;
            border-radius: 30px 0 0 30px; 
        }

        
        .search-bar button {
            background-color: #77DEEF;
            border: none;              
            padding: 15px 20px;
            border-radius: 30px; 
            cursor: pointer;           
            display: flex;
            align-items: center;
            justify-content: center;
        }

        
        .icon-search {
            display: inline-block;
            width: 16px;
            height: 16px;
            background-color: white;
            -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>') no-repeat center;
            mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>') no-repeat center;
            mask-size: contain;
        }
        
        #upload {
            align-self: flex-end;
            margin-top: 20px;
            margin-right: 150px;
            width: 112px;
            height: 35px;
            gap: 0px;
            border: none;
            border-radius: 10px 10px 0px 0px;
            opacity: 0px;
            cursor: pointer;

        }
        
        .container {
            display: flex;
            flex-direction: column; /* 세로 방향으로 정렬 */
            gap: 10px;              /* 버튼과 리스트 사이의 간격 */
        }

        #faqList{
            display: flex;
            flex-direction: column;
            list-style: none;
            padding: 0 13%;           
            margin-top: 20px;
            width: 100%;
            box-sizing: border-box;
        }

        #faqList li{
        padding-top: 15px;
        border-bottom: 1px solid #ddd;
        text-align: left;
        }

        #faqList li a{
        text-decoration: none;
        color: #333;
        font-size: 1.2em;
        }

         /* 임베드 상태에서 숨기기 */
        body.embed-mode #embed {
            display: none !important;
        }





    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removefaq() {
    const style = document.getElementById('faq-styles');
    if (style) {
        style.remove();
    }
}