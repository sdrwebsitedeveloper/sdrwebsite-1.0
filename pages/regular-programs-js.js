// pages/regular-programs.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import { firebaseConfig } from "../firebase.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function renderregularprograms() {
    // HTML 콘텐츠 렌더링
    document.getElementById('app').innerHTML = `
        <div class="content">
            <h1>정기 프로그램</h1>
            <p>선뚜리는 후배들을 위해 다양한 프로그램을 정기적으로 진행합니다</p>
            <div class="container">
                <div class="project-card" id="project1" onclick="window.location.href='#UFLEX'">
                    <img src="assets/images/uflex연뚜리.png" alt="유플렉스 연뚜리" class="project-image">
                    <h3 class="project-title">유플렉스 프로젝트</h3>
                    <p class="project-description">
                        함께 문화생활 할래요? 전시회 관람, 스포츠 직관, 방탈출 등 선뚜리가 여러분의 문화 생활을 지원합니다!
                    </p>
                </div>

                <div class="project-card" id="project2" onclick="window.location.href='#MATTOUR'">
                    <img src="assets/images/기웃기웃 연뚜리.png" alt="기웃기웃 연뚜리" class="project-image">
                    <h3 class="project-title">기웃기웃 프로젝트</h3>
                    <p class="project-description">
                        맛있는 것도 먹고 인연도 만들고! 함께 맛집을 탐방하며 소중한 인연들을 만들어나가요!
                    </p>
                </div>
            </div>
            
        </div>
    `;

    addregularprogramsStyles(); // 동적 스타일 추가
}


// 동적 스타일 추가
export function addregularprogramsStyles() {
    const style = document.createElement('style');
    style.id = 'regular-programs-styles';
    style.textContent = `
        body {
            font-family: KoPubDotum Medium;
            background-color: #F0F8FF;
            margin: 0;
            padding-top: 120px;
            justify-content: center;
            align-items: center;
        }

        h1 {
            font-family: HS산토끼체;
            font-size: 42px;
            font-weight: 300;
            line-height: 58.8px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #6F6F6F;


        }
        

        .content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            padding-bottom: 90px;
            background-color: white;
            border-radius: 10px;
            text-align: center;
        }

        .container {
            display: flex;
            justify-content: center;
            gap: 20px;
            max-width: 100%;
            margin: auto;
        }

        /* 프로젝트 카드 스타일 */
        .project-card {
            width: 280px;
            height: 406px;
            background: #FFFFFF;
            border: 2px solid #77DEEF;
            border-radius: 21px;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-sizing: border-box;
            padding-top: 20px;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .project-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }


        /* 이미지 요소 스타일 */
        .project-image {
            width: 194px;
            height: 195px;
            object-fit: contain;
            margin-top: 20px;
        }

        /* 프로젝트 제목 스타일 */
        .project-title {
            font-family: 'KoPubDotum Bold', sans-serif;
            font-style: normal;
            font-size: 17px;
            line-height: 19px;
            text-align: center;
            color: #3F3F3F;
            margin-top: 20px;
        }

        /* 프로젝트 설명 스타일 */
        .project-description {
            font-family: 'KoPubDotum Medium', sans-serif;
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 14px;
            text-align: center;
            color: #6F6F6F;
            width: 212px;
            margin-top: 10px;
        }
        
        @media (max-width: 480px) {
            h1 {
            font-family: HS산토끼체;
            font-size: 21px;
            font-weight: 300;
            line-height: 58.8px;
            text-align: center;
            text-underline-position: from-font;
            text-decoration-skip-ink: none;
            color: #6F6F6F;
            }

            p{
            font-family: 'KoPubDotum Medium', sans-serif;
            font-size: 10px;
            }
            /* 프로젝트 카드 스타일 */
            .project-card {
                width: 140px;
                height: 203px;
                background: #FFFFFF;
                border: 2px solid #77DEEF;
                border-radius: 21px;
                display: flex;
                flex-direction: column;
                align-items: center;
                box-sizing: border-box;
                padding-top: 20px;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .project-card:hover {
                transform: translateY(-10px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            }


            /* 이미지 요소 스타일 */
            .project-image {
                width: 97px;
                height: 97.5px;
                object-fit: contain;
                margin-top: 20px;
            }

            /* 프로젝트 제목 스타일 */
            .project-title {
                font-family: 'KoPubDotum Bold', sans-serif;
                font-style: normal;
                font-size: 8.5px;
                line-height: 9.5px;
                text-align: center;
                color: #3F3F3F;
                margin-top: 10px;
            }

            /* 프로젝트 설명 스타일 */
            .project-description {
                font-family: 'KoPubDotum Medium', sans-serif;
                font-style: normal;
                font-weight: 400;
                font-size: 6px;
                line-height: 7px;
                text-align: center;
                color: #6F6F6F;
                width: 106px;
                margin-top: 5px;
            }
        }
    `;
    document.head.appendChild(style);
}

// 동적 스타일 제거
export function removeregularprograms() {
    const style = document.getElementById('regular-programs-styles');
    if (style) {
        style.remove();
    }
}