import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const submitStudentApplication = async (formData) => {
  try {
    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("gmail", formData.gmail);
    data.append("studentId", formData.studentId);
    data.append("contact", formData.contact);
    if (formData.file) {
      data.append("resumeFile", formData.file);
    }

    const response = await axios.post(
      `${API_URL}/api/employees/register`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("ส่งฟอร์มสมัครไม่สำเร็จ:", error);
    throw error;
  }
};