import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";

import {
  uploadCV,
  getAllCVs,
  deleteCV,
  setActiveCV,
} from "../../services/cvService";

export default function MyCV() {
  const [confirmOpen, setConfirmOpen] = useState(false);
const [selectedCvId, setSelectedCvId] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(false);

  // GET ALL CVS
  const fetchCVs = async () => {
    try {
      const res = await getAllCVs();
      const data = res.data?.cvs || res.data || [];

      const formatted = data.map((cv, index) => ({
        ...cv,
        version: index + 1,
      }));

      setCvs(formatted);
    } catch (error) {
      console.log("Error loading CVs:", error);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, []);

  // UPLOAD CV
 const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    setLoading(true);
    console.log("File selected:", file.name, file.type, file.size); // شوفي البيانات هنا بتطبع صح ولا لاء
    await uploadCV(file);
    fetchCVs();
  } catch (error) {
    // هيطبع لك تفاصيل الخطأ اللي جاية من السيرفر بالظبط (سواء 400 أو 500 أو Network Error)
    console.error("Upload failed details:", error.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  // DELETE CV
  const handleDelete = async (id) => {
    setSelectedCvId(id);
  setConfirmOpen(true);
  };
const confirmDelete = async () => {
  if (!selectedCvId) return;

  try {
    setDeleteLoading(true);

    await deleteCV(selectedCvId);

    await fetchCVs();

    setConfirmOpen(false);
    setSelectedCvId(null);
  } catch (error) {
    console.log(error);
  } finally {
    setDeleteLoading(false);
  }
};
  // SET ACTIVE CV
  const handleActive = async (id) => {
    try {
      await setActiveCV(id);
      fetchCVs();
    } catch (error) {
      console.log(error);
    }
  };

  const activeCV = cvs.find((cv) => cv.isActive);
  const historyCVs = cvs;

  return (
    <div className="p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">My CV</h1>
        <p className="text-gray-500 mt-1">
          Manage your resumes and CV versions
        </p>
      </div>

      {/* UPLOAD */}
      <div className="bg-white rounded-2xl p-6 mt-6 shadow">
        <label className="border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">

          <UploadCloud className="w-8 h-8 text-indigo-600 mb-2" />

          <p className="font-semibold">
            {loading ? "Uploading..." : "Drop your CV here"}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            PDF & DOCX supported
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* ACTIVE CV */}
      {activeCV && (
        <div className="mt-6 border-2 border-green-500 bg-green-50 rounded-2xl p-5 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <div className="bg-green-100 p-3 rounded-xl">
              <FileText className="text-green-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">{activeCV.fileName}</h3>

                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={14} />
                  Active
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Uploaded{" "}
                {activeCV.createdAt &&
                  new Date(activeCV.createdAt).toLocaleDateString()}
              </p>

              <p className="text-xs text-gray-400">
                v{activeCV.version}
              </p>
            </div>

          </div>

          <Trash2
            className="cursor-pointer text-gray-500 hover:text-red-500"
            onClick={() => handleDelete(activeCV._id)}
          />
        </div>
      )}

      {/* HISTORY */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">CV History</h2>

        <div className="space-y-3">

          {historyCVs.length === 0 ? (
            <p className="text-gray-400 text-center">
              No CVs uploaded yet
            </p>
          ) : (
            historyCVs.map((cv) => (
              <div
                key={cv._id}
                className={`flex justify-between items-center p-4 rounded-2xl border transition ${
                  cv.isActive
                    ? "border-green-500 bg-green-50"
                    : "bg-white"
                }`}
              >

                {/* LEFT */}
                <div className="flex items-center gap-3">

                  <FileText className="text-gray-400" />

                  <div>

                    <h3 className="font-medium">
                      {cv.fileName}
                    </h3>

                   

                    <p className="text-xs text-gray-400">
                      Uploaded{" "}
                      {cv.createdAt &&
                        new Date(cv.createdAt).toLocaleDateString()}
                    </p>

                    <p className="text-xs text-gray-400">
                      v{cv.version}
                    </p>

                  </div>

                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2">

                  {/* ACTIONS */}
<div className="flex items-center gap-2">

  {cv.isActive ? (
    <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
      <CheckCircle size={14} />
      Active
    </span>
  ) : (
    <button
      onClick={() => handleActive(cv._id)}
      className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-sm hover:bg-indigo-700"
    >
      Set Active
    </button>
  )}

  <Trash2
    className="text-gray-400 hover:text-red-500 cursor-pointer"
    size={18}
    onClick={() => handleDelete(cv._id)}
  />

</div>
                  {/* <Trash2
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                    size={18}
                    onClick={() => handleDelete(cv._id)}
                  /> */}

                </div>

              </div>
            ))
          )}

        </div>
      </div>
<ConfirmModal
  open={confirmOpen}
  onClose={() => {
    setConfirmOpen(false);
    setSelectedCvId(null);
  }}
  title="Delete CV"
  message="Are you sure you want to delete this CV? This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  confirmVariant="destructive"
  onConfirm={confirmDelete}
  isLoading={deleteLoading}
/>
    </div>
  );
}