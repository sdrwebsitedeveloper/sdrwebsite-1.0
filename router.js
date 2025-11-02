// router.js
import { renderadmin, removeadminStyles } from '/pages/admin-js.js';
import { renderapplyPrograms, removeapplyProgramsStyles } from '/pages/apply-program-js.js';
import { rendereditnoticesmattour, removeeditnoticesmattour } from '/pages/edit-notices-mattour-js.js';
import { rendereditnoticesuflex, removeeditnoticesuflex } from '/pages/edit-notices-uflex-js.js';
import { rendereditprogramdetails, removeeditprogramdetails } from '/pages/edit-program-details-js.js';
import { rendereditprogram, removeeditprogram } from '/pages/edit-program-js.js';
import { rendereditreviewprogram, removeeditreviewprogram } from '/pages/edit-review-program-js.js';
import { renderfaqdetails, removefaqdetails} from '/pages/faq-details-js.js';
import { renderfaq, removefaq} from '/pages/faq-js.js';
import { renderlogin, removelogin} from '/pages/login-js.js';
import { renderMATTOUR, removeMATTOUR} from '/pages/MATTOUR-js.js';
import { rendernewapplyprogram, removenewapplyprogram} from '/pages/new-apply-program-js.js';
import { rendernewfaq, removenewfaq} from '/pages/new-faq-js.js';
import { rendernewMATTOUR, removenewMATTOUR} from '/pages/new-MATTOUR-js.js';
import { rendernewnoticesmattour, removenewnoticesmattour} from '/pages/new-notices-mattour-js.js';
import { rendernewnoticesuflex, removenewnoticesuflex} from '/pages/new-notices-uflex-js.js';
import { rendernewpost, removenewpost} from '/pages/new-post-js.js';
import { rendernewprogram, removenewprogram} from '/pages/new-program-js.js';
import { rendernewreviewprogram, removenewreviewprogram} from '/pages/new-review-program-js.js';
import { rendernewUFLEX, removenewUFLEX} from '/pages/new-UFLEX-js.js';
import { rendernoticesdetailsmattour, removenoticesdetailsmattour} from '/pages/notices-details-mattour-js.js';
import { rendernoticesdetailsuflex, removenoticesdetailsuflex} from '/pages/notices-details-uflex-js.js';
import { rendernoticesmattour, removenoticesmattour} from '/pages/notices-mattour-js.js';
import { rendernoticesuflex, removenoticesuflex} from '/pages/notices-uflex-js.js';
import { rendernotices, removenotices} from '/pages/notices-js.js';
import { renderpostdetails, removepostdetails} from '/pages/post-details-js.js';
import { renderprogramdetails, removeprogramdetails} from '/pages/program-details-js.js';
import { renderprograms, removeprograms} from '/pages/program-js.js';
import { renderregularprograms, removeregularprograms} from '/pages/regular-programs-js.js';
import { renderreviewdetails, removereviewdetails} from '/pages/review-details-js.js';
import { renderreviewprograms, removereviewprograms} from '/pages/review-programs-js.js';
import { renderUFLEX, removeUFLEX} from '/pages/UFLEX-js.js';
import { renderDashboard, removeDashboard} from '/pages/dashboard-js.js';
import { renderintroseonduri, removeintroseonduri} from '/pages/intro-seonduri-js.js';



const routes = {
    admin: { render: renderadmin, removeStyles: removeadminStyles },
    applyprogram: { render: renderapplyPrograms, removeStyles: removeapplyProgramsStyles },
    editnoticesmattour: { render: rendereditnoticesmattour, removeStyles: removeeditnoticesmattour },
    editnoticesuflex: { render: rendereditnoticesuflex, removeStyles: removeeditnoticesuflex },
    editprogramdetails: { render: rendereditprogramdetails, removeStyles: removeeditprogramdetails },
    editprogram: { render: rendereditprogram, removeStyles: removeeditprogram },
    editreviewprogram: { render: rendereditreviewprogram, removeStyles: removeeditreviewprogram },
    faqdetails: { render: renderfaqdetails, removeStyles: removefaqdetails },
    faq: { render: renderfaq, removeStyles: removefaq },
    login: { render: renderlogin, removeStyles: removelogin },
    MATTOUR: { render: renderMATTOUR, removeStyles: removeMATTOUR },
    newapplyprogram: { render: rendernewapplyprogram, removeStyles: removenewapplyprogram },
    newfaq: { render: rendernewfaq, removeStyles: removenewfaq },
    newMATTOUR: { render: rendernewMATTOUR, removeStyles: removenewMATTOUR },
    newnoticesmattour: { render: rendernewnoticesmattour, removeStyles: removenewnoticesmattour },
    newnoticesuflex: { render: rendernewnoticesuflex, removeStyles: removenewnoticesuflex },
    newpost: { render: rendernewpost, removeStyles: removenewpost },
    newprogram: { render: rendernewprogram, removeStyles: removenewprogram },
    newreviewprogram: { render: rendernewreviewprogram, removeStyles: removenewreviewprogram },
    newUFLEX: { render: rendernewUFLEX, removeStyles: removenewUFLEX },
    noticesdetailsmattour: { render: rendernoticesdetailsmattour, removeStyles: removenoticesdetailsmattour },
    noticesdetailsuflex: { render: rendernoticesdetailsuflex, removeStyles: removenoticesdetailsuflex },
    noticesmattour: { render: rendernoticesmattour, removeStyles: removenoticesmattour },
    noticesuflex: { render: rendernoticesuflex, removeStyles: removenoticesuflex },
    notices: { render: rendernotices, removeStyles: removenotices },
    postdetails: { render: renderpostdetails, removeStyles: removepostdetails },
    programdetails: { render: renderprogramdetails, removeStyles: removeprogramdetails },
    programs: { render: renderprograms, removeStyles: removeprograms },
    regularprograms: { render: renderregularprograms, removeStyles: removeregularprograms },
    reviewdetails: { render: renderreviewdetails, removeStyles: removereviewdetails },
    reviewprograms: { render: renderreviewprograms, removeStyles: removereviewprograms },
    UFLEX: { render: renderUFLEX, removeStyles: removeUFLEX },
    dashboard: { render: renderDashboard, removeStyles: removeDashboard },
    introseonduri: { render: renderintroseonduri, removeStyles: removeintroseonduri }

};

let currentRoute = null;




export function handleRouteChange() {
    const hashWithParams = window.location.hash.replace('#', '') || 'dashboard';
    const [hash, queryString] = hashWithParams.split('?');
    const route = routes[hash];

    // postdetails 처리 추가
    if (hash === 'postdetails') {
        renderpostdetails(queryString); // queryString 전달
        currentRoute = { name: 'postdetails' }; // currentRoute 설정
        return;
    }

    // 현재 페이지가 post-details이고 다른 페이지로 이동하는 경우 새로고침
    if (currentRoute && currentRoute.name === 'postdetails' && hash !== 'postdetails') {
        window.location.reload(); // 다른 페이지로 이동할 때만 새로고침
        return; // 새로고침 후 더 이상의 코드 실행을 방지
    }

    // login 페이지에서 dashboard로 이동할 때 새로고침
    if (hash === 'dashboard' && currentRoute && currentRoute === routes['login']) {
        window.location.reload();
        return; // 새로고침 후 더 이상의 코드 실행을 방지
    }

    // programs 페이지에서 programdetails로 이동할 때 새로고침
    if (hash === 'programdetails' && currentRoute && currentRoute === routes['programs']) {
        window.location.reload();
        return; // 새로고침 후 더 이상의 코드 실행을 방지
    }

    // programs 페이지에서 programdetails로 이동할 때 새로고침
    if (hash === 'applyprogram' && currentRoute && currentRoute === routes['programs']) {
        window.location.reload();
        return; // 새로고침 후 더 이상의 코드 실행을 방지
    }



    // 중복 호출 방지: 동일한 페이지로 이동하려는 경우 함수 호출 중단
    if (currentRoute === route) {
        return;
    }

    if (route) {
        if (currentRoute && currentRoute.removeStyles) {
            currentRoute.removeStyles();
        }
        route.render();
        currentRoute = route;
    } else {
        document.getElementById('app').innerHTML = '<h1>404 - Page Not Found</h1>';
    }
}


// 라우터 초기화
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('load', handleRouteChange);