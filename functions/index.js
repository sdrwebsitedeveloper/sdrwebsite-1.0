const {
    functions,
    admin,
    db,
    blockedIPsRef,
    mailTransport,
    URL
} = require('./firebasesetup');

exports.sendEmailNotification = functions.https.onCall(async (data, context) => {
    const faqId = data.faqId;
    const faqRef = db.ref('faqs/' + faqId);

    return faqRef.once('value').then(snapshot => {
        const faq = snapshot.val();
        const email = faq.email;

        if (!email) {
            console.error('이메일 필드가 비어 있습니다.', faq); // 오류 로그 추가
            throw new functions.https.HttpsError('invalid-argument', '이메일이 제공되지 않았습니다.');
        }

        // FAQ 상세 페이지 링크 생성
        const faqLink = `${URL}/#faqdetails?id=${faqId}`;

        const mailOptions = {
            from: 'noreply@firebase.com',
            to: email,
            subject: '새 댓글이 달렸습니다',
            text: `당신의 FAQ 문의사항에 대한 답장이 왔습니다: ${faq.title}\n\n상세 내용은 다음 링크를 통해 확인할 수 있습니다: ${faqLink}`,
        };

        return mailTransport.sendMail(mailOptions)
            .then(() => {
                console.log('이메일이 성공적으로 전송되었습니다:', email);
                return { success: true };
            })
            .catch((error) => {
                console.error('이메일 전송 중 오류 발생:', error);
                throw new functions.https.HttpsError('internal', '이메일 전송 중 오류가 발생했습니다.');
            });
    });
});


exports.checkAndBlockIP = functions.https.onCall(async (data, context) => {
    console.log('checkAndBlockIP called');
    console.log('data:', data);
    console.log('context.rawRequest:', !!context.rawRequest);
    console.log('context.auth:', context.auth ? context.auth.uid : 'unauthenticated');
    console.log('context.instanceIdToken:', context.instanceIdToken || 'none');

    try {
        const userIP =
            (context.rawRequest && context.rawRequest.ip) ||
            data.ip ||
            'unknown';
        console.log('Extracted IP:', userIP);

        if (userIP === 'unknown') {
            console.warn('Could not determine IP. data:', data);
            throw new functions.https.HttpsError(
                'invalid-argument',
                'IP 주소를 확인할 수 없습니다.'
            );
        }

        const snapshot = await blockedIPsRef.once('value');
        const blockedIPs = snapshot.val() || [];
        console.log('Blocked IP list loaded:', blockedIPs);

        if (blockedIPs.includes(userIP)) {
            console.warn('Blocked IP detected:', userIP);
            throw new functions.https.HttpsError(
                'permission-denied',
                'This IP address is blocked.'
            );
        }

        console.log('IP check passed:', userIP);
        return { ip: userIP };
    } catch (error) {
        console.error('IP 차단 중 오류 발생:', error);
        throw new functions.https.HttpsError(
            'internal',
            '서버 내부 오류가 발생했습니다.'
        );
    }
});


// IP를 차단하는 함수
exports.blockIP = functions.https.onCall(async (data, context) => {
    try {
        const ipToBlock = data.ip;

        if (!ipToBlock) {
            throw new functions.https.HttpsError('invalid-argument', 'IP 주소가 제공되지 않았습니다.');
        }

        // 차단된 IP 목록에 IP 추가
        await blockedIPsRef.push(ipToBlock);

        return { message: `IP ${ipToBlock}가 성공적으로 차단되었습니다.` };
    } catch (error) {
        console.error('IP 차단 중 오류 발생:', error);
        throw new functions.https.HttpsError('internal', 'IP 차단 중 오류가 발생했습니다.');
    }
});

// IP 차단을 해제하는 함수
exports.unblockIP = functions.https.onCall(async (data, context) => {
    try {
        const ipToUnblock = data.ip;

        if (!ipToUnblock) {
            throw new functions.https.HttpsError('invalid-argument', 'IP 주소가 제공되지 않았습니다.');
        }

        // 차단된 IP 목록에서 IP 제거
        const snapshot = await blockedIPsRef.once('value');
        snapshot.forEach(childSnapshot => {
            if (childSnapshot.val() === ipToUnblock) {
                childSnapshot.ref.remove();
            }
        });

        return { message: `IP ${ipToUnblock}가 성공적으로 차단 해제되었습니다.` };
    } catch (error) {
        console.error('IP 차단 해제 중 오류 발생:', error);
        throw new functions.https.HttpsError('internal', 'IP 차단 해제 중 오류가 발생했습니다.');
    }
});


