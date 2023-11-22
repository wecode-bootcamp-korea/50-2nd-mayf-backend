const database = require("./datasource")

// 요청 이메일 존재 여부 확인
const checkHost = async (email) => {
    const result = await database.appDataSource.query(`
        SELECT 
            id,
            name,
            email,
            phone_number,
            credit,
            bank_account,
            deleted_at
        FROM 
            hosts
        WHERE 
            email = ?
        `, [email]);
    return result;
};
// 회원가입
const hostSignup = async (name, email, phone_number) => {
    const result = await database.appDataSource.query(`
        INSERT INTO hosts
            (name, email, phone_number, credit, created_at) 
        VALUES 
            (?, ?, ?, ?, NOW());
        `, [name, email, phone_number, 0]);
    return result;
};
// 호스트 정보 수정
const hostUpdateByInfo = async (hostId, { name, phone_number, bank_account }) => {
    const hostUpdateInfo = await database.appDataSource.query(`
        UPDATE hosts
        SET
            name = ?,
            phone_number = ?,
            bank_account = ?,
            updated_at = NOW()
        WHERE id = ?
        `, [name, phone_number, bank_account, hostId]);
    return hostUpdateInfo
};
// 호스트 강의 스케줄 확인
const checkHostClassByHostId = async (hostId) => {
    const query = `
        SELECT
            id, title, host_id
        FROM
            classes
        WHERE
            host_id = ?
        AND
            deleted_at IS NULL;
    `
    return database.appDataSource.query(query, [hostId]);
};

// 호스트 정보 삭제
const deleteRealHost = async (hostId) => {
    return await database.appDataSource.query(`UPDATE hosts SET deleted_at = NOW() WHERE id = ?`, [hostId]);
};

module.exports = {
    checkHost,
    hostSignup,
    hostUpdateByInfo,
    checkHostClassByHostId,
    deleteRealHost
}

