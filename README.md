# 1) 클론으로 다운 or 우측 상단 Code ▸ Download ZIP
git clone https://github.com/sdrwebsitedeveloper/sdrwebsite-1.0.git
cd sdrwebsite-1.0

# 2) Firebase CLI 전역 설치 (!13판이 아닌 최신판이면 의존성이 많이 깨지니 꼭 13판으로 설치부탁드립니다)
npm install -g firebase-tools@13

# 3) Functions 의존성 설치
cd functions
npm install

# 4) 첨부한 firebase설정방법.word 파일에 따라 firebase 설정 및 배포
