// pages/dashboard.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function renderDashboard() {
    // 네비게이션 버튼 제외한 대시보드 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div style="margin-top: 164px;">
            <p class="text_main-title_kopub">연세인의 영원한 선배</p>
            <div style="text-align: center;">
                <a class="text_main-title_rabbit">선뚜리</a><a class="text_main-title_kopub">입니다</a>
            </div>
        </div>

        <div class="image-container">
            <img class="img_main_S" src="/assets/images/선물.png">
            <img class="img_main_M" src="/assets/images/놀람.png">
            <img class="img_main_L" src="/assets/images/연뚜리1.png">
            <img class="img_main_M" src="/assets/images/감탄.png">
            <img class="img_main_S" src="/assets/images/취함.png">
        </div>

        <div class="blue-overlap2"></div>

        <div style="padding-bottom: 118px;" class="body_blue">
            <div style="margin-left: 20%; float: left;">
                <p class="text_subtitle_rabbit">선뚜리와 함께해요!</p>
                <p class="text_caption_kopub">선뚜리와 함께 할 수 있는 기회!</p>
                <p class="text_caption_kopub">현재 진행중인 이벤트를 확인해보세요!</p>
                
                <button style="margin-top: 40px;" class="button_white_M" type="button" onclick="window.location.hash='programs'">진행중인 프로그램</button>
            </div>
        
            <img class="img_content_right" src="/assets/images/아카라카.png">
        </div>

        <div class="info_gray">
            <p style="margin-top: 30px; text-align: center;" class="text_caption_small_kopub">인스타 | @SDR_YONSEI</p>
        </div>

        <div class="info_gray">
            <p style="margin-top: ; text-align: center;" class="text_caption_small_kopub">Notion | https://yonseiwiki.notion.site/6e3975aa690743c98e09035e16c2dc02?v=b83bbc5b963e4a12b657db848a1fa99a</p>
        </div>
    `;
    addDashboardStyles();
}

// 동적 스타일 추가
export function addDashboardStyles() {
    const style = document.createElement('style');
    style.id = 'dashboard-styles';
    style.textContent = `
        @font-face {
    font-family: 'HS산토끼체'; /* 원하는 폰트 이름으로 지정 */
    src: url('/assets/fonts/HSSanTokki2.0(2024).ttf') format('truetype');
    
}

@font-face {
    font-family: 'KoPubDotum Medium'; 
    src: url('/assets/fonts/KoPubWorld Dotum Medium.ttf') format('truetype');
}


body{
    background-color: #FFFFFF;
}

.body_blue{
    background-color: #77DEEF;
    overflow: hidden;
}

.blue-overlap2{
    position: relative; /* 부모 요소에 상대 위치 설정 */
    margin-top: -6vw; /* 화면 너비에 비례하여 조정 */
    padding-top: 20vw; /* 화면 너비에 따라 조정 */
    padding-bottom: 8vw;
    background-color: #77DEEF; /* 배경색 설정 */
    z-index: 2;
    
}




.info_gray{
    background: #6F6F6F;
    overflow: hidden;
    height: 43px; 
}


.button_white_M{
    width: 172px; 
    height: 50px;
    background: white; 
    border-radius: 30px; 
    border: 1px #77DEEF solid;
    cursor: pointer;

    font-size: 14px; 
    text-align: center; 
    color: #77DEEF; 
    font-family: 'HS산토끼체'; 
    font-weight: 400; 
    
}


/* 텍스트*/
.text_main-title_kopub{
    font-size: 42px;
    color: #6F6F6F; 
    font-family: 'KoPubDotum Medium'; 
    text-align: center;
    padding-top: 20px;
    margin-top: -15px;
}

.text_main-title_rabbit{
    font-size: 44px; 
    color: #3F3F3F; 
    font-family: 'HS산토끼체'; 
}

.text_subtitle_rabbit{
    font-size: 24px;
    color: white; 
    font-family: 'HS산토끼체'; 
}

.text_caption_kopub{
    font-size: 17px; 
    color: #ffffff; 
    font-family: 'KoPubDotum Medium'; 
    margin: 2;
}

.text_caption_small_kopub{
    font-size: 12px; 
    color: #ffffff; 
    font-family: 'KoPubDotum Light'; 
    margin: 2;
}


.img_content_right{
    width: 550px; 
    float: right; 
    margin-right: 20%;
}

/* 전체 컨테이너 스타일 */
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5vw; /* 요소 간격을 vw 단위로 설정 */
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: flex-end; /* 이미지들이 아래쪽에 정렬되도록 설정 */
    gap: 1vw; /* 이미지 간격 */
    margin-top: -100px; /* 상단 여백 제거 */
    padding: 0; /* 내부 여백 제거 */
}

.img_main_S {
    width: 7vw;
    height: auto;
    top: 5px;
    z-index: -2;
}

.img_main_M {
    width: 10vw;
    height: auto;
    top: 4px;
    z-index: -2;
}

.img_main_L {
    width: 15vw;
    height: auto;
    top: 100px;
    position: relative;
}

.img_main_S,
.img_main_M,
.img_main_L {
    margin: 0; /* 이미지 자체 여백 제거 */
    padding: 0; /* 이미지 자체 패딩 제거 */
    position: relative;
}

.blue-overlap2 {
    margin-top: 0; /* 위쪽 여백 제거 */
    padding-top: 10vw;
    padding-bottom: 10vw; /* 화면 비율에 따라 패딩 조정 */
    background-color: #77DEEF;
    position: relative;
    z-index: -1; /* 이미지와 겹쳐지도록 설정 */
}

/* 이미지가 blue-overlap2와 붙도록 설정 */
.img_main_S, .img_main_M, .img_main_L {
    bottom: -20px; /* blue-overlap2와 딱 붙도록 약간 내림 */
}


/* 작은 화면 대응 */
@media (max-width: 768px) {

    .text_main-title_kopub {
        font-size: 28px;
    }

    .text_main-title_rabbit {
        font-size: 30px;
    }

    .text_subtitle_rabbit {
        font-size: 18px;
    }

    .text_caption_kopub,
    .text_caption_small_kopub {
        font-size: 12px;
    }
    
    .img_main_S {
        width: 15vw;
    }
    .img_main_M {
        width: 20vw;
    }
    .img_main_L {
        width: 25vw;
    }

    .blue-overlap2 {
        margin-top: -3vw;
        padding-top: 15vw;
        padding-bottom: 8vw;
    }
    
    .img_content_right{
        width: 150px; 
        float: right; 
        margin-right: 20%;
    }

    .button_white_M{
        width: 86px; 
        height: 25px;
        background: white; 
        border-radius: 30px; 
        border: 1px #77DEEF solid;
        cursor: pointer;

        font-size: 7px; 
        text-align: center; 
        color: #77DEEF; 
        font-family: 'HS산토끼체'; 
        font-weight: 400; 
        
    }
}

@media (max-width: 480px) {

    .text_main-title_kopub {
        font-size: 24px;
        
    }

    .text_main-title_rabbit {
        font-size: 26px;
    }

    .text_subtitle_rabbit {
        font-size: 16px;
    }

    .text_caption_kopub,
    .text_caption_small_kopub {
        font-size: 10px;
    }
    
    .img_main_S {
        width: 6vw;
        margin-top: 120px;
    }
    .img_main_M {
        width: 8vw;
        margin-top: 120px;
    }
    .img_main_L {
        width: 10vw;
        top: 20px;
    }

    .blue-overlap2 {
        margin-top: 0px;
        padding-top: 10vw;
        padding-bottom: 6vw;
    }
    
    .img_content_right{
        width: 150px; 
        float: right; 
        margin-right: 20%;
    }

    .button_white_M{
        width: 86px; 
        height: 25px;
        background: white; 
        border-radius: 30px; 
        border: 1px #77DEEF solid;
        cursor: pointer;

        font-size: 7px; 
        text-align: center; 
        color: #77DEEF; 
        font-family: 'HS산토끼체'; 
        font-weight: 400; 
        
    }
}



    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeDashboard() {
    const style = document.getElementById('dashboard-styles');
    if (style) {
        style.remove();
    }
}