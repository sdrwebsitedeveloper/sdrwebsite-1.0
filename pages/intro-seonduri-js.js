import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function renderintroseonduri() {
    // 네비게이션 버튼 제외한 대시보드 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="container">
            <h1 class="title">선뚜리 소개</h1>
            <div class="outer-container">
                <div class="image-container">
                    <div class="image-background"></div>
                    <img src="assets/images/배경 제거 프로젝트 (5).png" alt="선뚜리 이미지" class="main-image">
                </div>
            </div>
            <div class="description-box">
                <h2 class="subtitle">선뚜리란?</h2>
                <p class="description">
                    선뚜리는 연세대학교 학생들을 위해 항상 노력하는 학생단체입니다.<br>
                    함께 협력하는 연세를 위해 오늘도 달립니다!<br>
                    학교 생활 중 궁금한 게 생기면 언제든 선뚜리에게 질문하세요!
                </p>
                <div class="button-group">
                    <button class="program-button" onclick="window.location.href='#regularprograms'">정기 프로그램</button>
                    <button class="program-button" onclick="window.location.href='#programs'">진행중인 프로그램</button>
                </div>
            </div>
        </div>
    `;
    addintroseonduriStyles();
}

// 동적 스타일 추가
export function addintroseonduriStyles() {
    const style = document.createElement('style');
    style.id = 'introseonduri-styles';
    style.textContent = `
        
        .container {
            margin-top:50px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        
        .title {
            position: absolute;
            width: 490px;
            height: 45px;
            left: calc(50% - 490px / 2);
            top: 140px;
            font-family: 'HS산토끼체', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 42px;
            line-height: 59px;
            text-align: center;
            color: #6F6F6F;
        }

        
        .image-container {
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            width: 100%; /* 부모 요소 너비를 가득 차게 설정 */
            height: 100vh; /* 화면 전체 높이 설정 */
        }

        /* 이미지 배경 */
        .image-background {
            width: 177px;
            height: 177px;
            background: #E9E9E9;
            border: 5px solid #FFFFFF;
            border-radius: 50%;
            position: absolute;
            z-index: 1;
            transform: translateY(-60px);
        }
        
        .outer-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }


        /* 메인 이미지 */
        .main-image {
            width: 144px;
            height: 145px;
            border-radius: 50%;
            position: relative;
            z-index: 2;
            transform: translateY(-60px);
        }



        
        .description-box {
            position: absolute;
            width: 1144px;
            height: 343px;
            left: calc(50% - 1144px / 2);
            top: 309px;
            background: #77DEEF;
            border-radius: 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding-top: 60px;
            box-sizing: border-box;
            z-index: 0;
        }

        .subtitle {
            font-family: 'HS산토끼체', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 24px;
            line-height: 34px;
            text-align: center;
            color: #FFFFFF;
            margin-bottom: 20px;
        }

        .description {
            font-family: 'KoPubDotum Medium', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 17px;
            line-height: 19px;
            text-align: center;
            color: #FFFFFF;
            width: 450px;
            margin: 0 auto;
            margin-bottom: 30px;
        }

        .button-group {
            display: flex;
            gap: 20px;
        }

        .program-button {
            width: 140px;
            height: 43px;
            background: #FFFFFF;
            border: 1px solid #77DEEF;
            border-radius: 30px;
            font-family: 'HS산토끼체', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;
            text-align: center;
            color: #77DEEF;
            cursor: pointer;
        }

        .program-button:hover {
            background-color: #e0f7ff;
        
        }
        
        @media (max-width: 480px) {
                .title {
                position: absolute;
                width: 490px;
                height: 45px;
                left: calc(50% - 490px / 2);
                top: 140px;
                font-family: 'HS산토끼체', sans-serif;
                font-style: normal;
                font-weight: 400;
                font-size: 21px;
                line-height: 59px;
                text-align: center;
                color: #6F6F6F;
            }

            
            .image-container {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                width: 100%; /* 부모 요소 너비를 가득 차게 설정 */
                height: 100vh; /* 화면 전체 높이 설정 */
            }

            /* 이미지 배경 */
            .image-background {
                width: 88.5px;
                height: 88.5px;
                background: #E9E9E9;
                border: 5px solid #FFFFFF;
                border-radius: 50%;
                position: absolute;
                z-index: 1;
                transform: translateY(-60px);
            }
            
            .outer-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }


            /* 메인 이미지 */
            .main-image {
                width: 72px;
                height: 72.5px;
                border-radius: 50%;
                position: relative;
                z-index: 2;
                transform: translateY(-60px);
            }



            
            .description-box {
                position: absolute;
                width: 1144px;
                height: 271.5px;
                left: calc(50% - 1144px / 2);
                top: 309px;
                background: #77DEEF;
                border-radius: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-top: 60px;
                box-sizing: border-box;
                z-index: 0;
            }

            .subtitle {
                font-family: 'HS산토끼체', sans-serif;
                font-style: normal;
                font-weight: 400;
                font-size: 12px;
                line-height: 34px;
                text-align: center;
                color: #FFFFFF;
                margin-bottom: 20px;
                top:220px;
            }

            .description {
                font-family: 'KoPubDotum Medium', sans-serif;
                font-style: normal;
                font-weight: 400;
                font-size: 8.5px;
                line-height: 19px;
                text-align: center;
                color: #FFFFFF;
                width: 450px;
                margin: 0 auto;
                margin-bottom: 30px;
            }

            .button-group {
                display: flex;
                gap: 20px;
            }

            .program-button {
                width: 70px;
                height: 21.5px;
                background: #FFFFFF;
                border: 1px solid #77DEEF;
                border-radius: 30px;
                font-family: 'HS산토끼체', sans-serif;
                font-style: normal;
                font-weight: 400;
                font-size: 6px;
                line-height: 17px;
                text-align: center;
                color: #77DEEF;
                cursor: pointer;
            }
        }
    
    

    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거addintroseonduriStyles
export function removeintroseonduri() {
    const style = document.getElementById('introseonduri-styles');
    if (style) {
        style.remove();
    }
}