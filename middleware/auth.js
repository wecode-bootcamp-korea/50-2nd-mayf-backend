const token = require('jsonwebtoken');
const secretkey = process.env.TYPEORM_SECRETKEY
const bcrypt = require('bcrypt');
// 패스워드 암호화
const makehash = async(password, saltRound) => {
    return await bcrypt.hash(password, saltRound);
}
//패스워드 복호화
const decode = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
// 토큰 검증
const adminTokenDecode = async(jwtToken, secretkey) => {
    return token.verify(jwtToken, secretkey);
};
// adminVerify토큰 검증
const adminVerifyToken  = async (req, res, next) => {
    const jwtToken = req.headers.authorization.substr(7);
    if(!jwtToken){
        res.status(403).json({message : '권한이 없습니다'})
    }else{
        try{
            const decoded = await adminTokenDecode(jwtToken, secretkey);
            req.admin = decoded;
            next();
        }catch(err){
            return res.status(403).json({message : '권한이 없습니다.'})
        }
    }
};
const adminCreateToken = async(id, admin_id) => {
    const payload = {id, admin_id};
    return token.sign(payload, secretkey)
};
// 토큰 검증
const userTokenDecode = async(jwtToken, secretkey) => {
    return token.verify(jwtToken, secretkey);
};
// userVerify토큰 검증
const userVerifyToken  = async (req, res, next) => {
    const jwtToken = req.headers.authorization;
    if(!jwtToken){
        res.status(403).json({message : '권한이 없습니다'})
    }else{
        try{
            const decoded = await userTokenDecode(jwtToken, secretkey);
            req.users = decoded;
            next();
        }catch(err){
            return res.status(403).json({message : '권한이 없습니다.'})
        }
    }
};
const userCreateToken = async(id, name, email, phone_number) => {
    const payload = {id, name, email, phone_number};
    const options = {expiresIn: 720000};
    return token.sign(payload, secretkey, options)
};
// 토큰 검증
const hostTokenDecode = async(jwtToken, secretkey) => {
    return token.verify(jwtToken, secretkey);
};
// hostVerify토큰 검증
const hostVerifyToken  = async (req, res, next) => {
    const jwtToken = req.headers.authorization;
    if(!jwtToken){
        res.status(403).json({message : '권한이 없습니다'})
    }else{
        try{
            const decoded = await hostTokenDecode(jwtToken, secretkey);
            req.hosts = decoded;
            next();
        }catch(err){
            return res.status(403).json({message : '권한이 없습니다.'})
        }
    }
};
const hostCreateToken = async(id, name, email, phone_number) => {
    const payload = {id, name, email, phone_number};
    const options = {expiresIn: 720000};
    return token.sign(payload, secretkey, options)
};
module.exports = {
    adminVerifyToken, adminTokenDecode, adminCreateToken, userVerifyToken, userTokenDecode, userCreateToken,
    hostVerifyToken, hostTokenDecode, hostCreateToken, makehash, decode
}