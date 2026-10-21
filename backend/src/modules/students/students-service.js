const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudentById } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const student = await findUserById(id);
    if (!student || student.role_id !== 3) {
        throw new ApiError(404, "Student not found");
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    if (students.length <= 0) {
        throw new ApiError(404, "Students not found");
    }

    return students;
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    return student;
}

const addNewStudent = async (payload) => {
    const ADD_STUDENT_AND_EMAIL_SEND_SUCCESS = "Student added and verification email sent successfully.";
    const ADD_STUDENT_AND_EMAIL_SEND_FAIL = "Student added, but failed to send verification email.";
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        const statusCode = result.message === "Email already exists" ? 409 : 500;
        throw new ApiError(statusCode, result.message || "Unable to add student");
    }

    try {
        await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
        return { id: result.userId, message: ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
    } catch {
        return { id: result.userId, message: ADD_STUDENT_AND_EMAIL_SEND_FAIL };
    }
}

const updateStudent = async (payload) => {
    await checkStudentId(payload.userId);
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message || "Unable to update student");
    }

    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, "Unable to update student status");
    }

    return { message: "Student status changed successfully" };
}

const deleteStudent = async (id) => {
    const result = await deleteStudentById(id);
    if (!result.found) {
        throw new ApiError(404, "Student not found");
    }
    if (!result.deleted) {
        throw new ApiError(409, "Student cannot be deleted while related records exist");
    }

    return { message: "Student deleted successfully" };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
