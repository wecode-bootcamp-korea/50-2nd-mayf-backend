const userDao = require("../models/userDao");
const userVerifyToken = require("../middleware/auth");
const axios = require('axios');
const { error } = require('../middleware/error');
const dotenv = require('dotenv');
dotenv.config();

//전화번호 변환 함수
const phoneNumberConversion = (phoneNumber) => {
    // +82를 제거하고 남은 숫자만 추출
    const extrackPhoneNumber = phoneNumber.replace('+82 10', '');
    //010시작인지 확인하고 아니라면 +82 붙여주기(삼항연산) 후 -기호 추가
    const addSymbol = (extrackPhoneNumber.startsWith('010') ? 
    extrackPhoneNumber : `010${extrackPhoneNumber}`)
    .replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    return addSymbol;
};
// 회원가입 
const userSignup = async (code) => {
    try {
        const authToken = await axios.post('https://kauth.kakao.com/oauth/token', {}, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                params:{
                    grant_type: 'authorization_code',
                    client_id: process.env.KAKAO_KEY,
                    code,
                    redirect_uri: process.env.KAKAO_USER_URL
                }
            });
            console.log('테스트 코드용 authToken', authToken);
            const refreshToken = authToken.data.refresh_token;
            const accessToken = authToken.data.access_token;

        // 카카오 API를 통해 사용자 정보 가져오기
        const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                Authorization: `Bearer ${accessToken}`
            },
        });
        console.log('테스트 코드용 response', response)

        if (!response || response.status !== 200) {
            error(400, '카카오 연결 안됨');
        }
        console.log('테스트 코드용 response.data.kakao_account',response.data.kakao_account)
    
        const { name, email, phone_number } = response.data.kakao_account;

        //전화번호 010으로 변환
        const changeFirstNumber = phoneNumberConversion(phone_number);

        // 이미 가입된 사용자인지 확인
        const userData = await userDao.checkUser(email);
        if (userData.length === 0) {
            // 가입되지 않은 경우 회원가입
            await userDao.userSignup(name, email, changeFirstNumber,accessToken,refreshToken);
            const newUserData = await userDao.checkUser(email);
            const tokenIssuance = newUserData[0].id;
            const jwtToken = await userVerifyToken.userCreateToken(tokenIssuance, name, email, changeFirstNumber);
            return jwtToken;
        };
        // 이미 가입된 사용자인 경우 로그인 처리
        await userDao.updateToken(accessToken,refreshToken,email);
        const tokenIssuance = userData[0].id;
        const jwtToken = await userVerifyToken.userCreateToken(tokenIssuance, name, email, userData[0].phone_number);
        return jwtToken;
    } catch (err) {
        console.error(err);
        throw err;
    }
};
//유저 정보 조회
const getUserByInfo = async (userId, userEmail) => {
    try {
        // 유저 확인
        const userGetInfoList = await userDao.checkUser(userEmail);
        // 유저가 존재하지 않는 경우 처리
        if (!userGetInfoList || userGetInfoList.length === 0) {
            error(400,'User does not exist');
        }else if(userGetInfoList[0].id !== userId ){
            error(400,'Invalid user ID');
        }
        // 유저 정보 조회 반환
        return userGetInfoList;
    } catch (err) {
        console.error("Error in getUser:", err);
        throw err;
    }
};
//유저 정보 수정
const updateUser = async(userId, userEmail, userUpdateInfo) => {
    try{
        // 유저 확인 및 정보 조회
        const userUpdateByCheck = await userDao.checkUser(userEmail);
        // 유저가 존재하지 않는 경우 처리
        if(!userUpdateByCheck || userUpdateByCheck.length === 0) {
            error(400,'User does not exist');
        }else if(userUpdateByCheck[0].id !== userId ){
            error(400,'Invalid user ID');
        }
        //유저 정보 수정
        const userUpdateList = await userDao.userUpdateByInfo(userId, userUpdateInfo);
        return userUpdateList;
    }catch (err) {
        console.error("Error in updateUser:", err);
        throw err;
    }
};
//유저 정보 삭제
const deleteUserByInfo = async (userId, userEmail) => {
    try {
        // 유저 확인
        const userDeleteInfoList = await userDao.checkUser(userEmail);
        // 유저가 존재하지 않는 경우 처리
        if (!userDeleteInfoList || userDeleteInfoList.length === 0) {
            error(400,'User does not exist'); 
        }else if(userDeleteInfoList[0].id !== userId){
            error(400,'Invalid user ID');
        };
        // 유저 크레딧 확인
        if(userDeleteInfoList[0].credit> 0){
            error(400,'USER_CREDIT_ISSUE')
        };
        // 유저 강의 신청 예약 확인
        const checkUserSchedulByUserId = await userDao.checkUserSchedulByUserId(userId);
        if(checkUserSchedulByUserId.length > 0){
            error(400,'USER_SCHEDULE_ISSUE')
        };
        // 유저 정보 삭제
        await userDao.userDeleteByInfo(userId);
        return ({message: 'USER_DELETED_SUCCESS'});
    } catch (err) {
        console.error("Error in deleteUser:", err);
        throw err;
    };
};
//유저 크레딧 조회
const getUserByCredit = async (userId) => {
    try {
        // 사용자 확인 및 크레딧 조회
        const userCreditList = await userDao.checkUser(userId);
        // 사용자가 존재하지 않는 경우 처리
        if (!userCreditList || userCreditList.length === 0) {
            error(400,'User does not exist');
        }else if(userCreditList[0].id !== userId ){
            error(400,'Invalid user ID');
        }
        // 사용자 크레딧 조회 반환
        return userCreditList;
    } catch (err) {
        console.error("Error in getUserCredit:", err);
        throw err;
    }
};

module.exports = {
    userSignup, getUserByInfo, updateUser, deleteUserByInfo, getUserByCredit
};
