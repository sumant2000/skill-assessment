const asyncHandler = require("express-async-handler");
const { ApiError } = require("../../utils");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const getStudentId = (req) => {
    const { id } = req.params;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        throw new ApiError(400, "Invalid student ID");
    }

    return Number(id);
};

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const { name, class: className, section, roll } = req.query;
    const students = await getAllStudents({ name, className, section, roll });
    res.json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const result = await addNewStudent(req.body);
    res.json(result);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const userId = getStudentId(req);
    const result = await updateStudent({ ...req.body, userId });
    res.json(result);
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const student = await getStudentDetail(getStudentId(req));
    res.json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const userId = getStudentId(req);
    const { status } = req.body;
    if (typeof status !== "boolean") {
        throw new ApiError(400, "Status must be a boolean");
    }

    const message = await setStudentStatus({ userId, reviewerId: req.user.id, status });
    res.json(message);
});

const handleDeleteStudent = asyncHandler(async (req, res) => {
    const message = await deleteStudent(getStudentId(req));
    res.json(message);
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent,
};
