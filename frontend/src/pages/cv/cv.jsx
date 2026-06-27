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
import { toast } from "react-hot-toast";

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
    console.log("File selected:", file.name, file.type, file.size); 
    await uploadCV(file);
    fetchCVs();
  } catch (error) {
    console.error("Upload failed details:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || "Failed to upload your CV.";
    toast.error(errorMessage);
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
    const errorMessage = error.response?.data?.message || "Could not delete the CV.";
    toast.error(errorMessage);
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
      const errorMessage = error.response?.data?.message || "Failed to update active CV.";
      toast.error(errorMessage);
    }
  };

  const activeCV = cvs.find((cv) => cv.isActive);
  const historyCVs = cvs;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-7">

      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My CV</h1>
        <p className="text-muted-foreground font-medium">
          Manage your resumes and CV versions
        </p>
      </div>

      {/* UPLOAD */}
      <div className="bg-card text-card-foreground rounded-lg p-6 border border-border shadow-sm transition-all duration-200">
        <label className="border-2 border-dashed border-border rounded-lg h-44 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/40 hover:border-brand-primary/50 group transition-all duration-200">
          <div className="p-3 bg-muted rounded-full group-hover:bg-brand-primary/10 group-hover:scale-105 transition-all duration-200 mb-3">
            <UploadCloud className="w-6 h-6 text-muted-foreground group-hover:text-brand-primary transition-colors" />
          </div>

          <p className="font-medium text-foreground text-sm">
            {loading ? "Uploading..." : "Drop your CV here"}
          </p>

          <p className="text-sm text-muted-foreground mt-1">
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
        <div className="border border-status-success bg-card text-foreground rounded-xl p-4 flex justify-between items-center shadow-sm">

          <div className="flex items-center gap-4">

            <div className="bg-status-success/10 p-3 rounded-xl border border-status-success/10">
              <FileText className="text-status-success w-5 h-5" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm text-foreground">{activeCV.fileName}</h3>

                <div className="flex gap-2">
                  <span className="text-[12px] bg-status-success text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle size={12} />
                    Active
                  </span>

                  <span className="text-[12px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md border border-border">
                    v{activeCV.version}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Uploaded {activeCV.createdAt && new Date(activeCV.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {activeCV.fileSize || "284 KB"}
              </p>
            </div>
          </div>

          <button 
            onClick={() => handleDelete(activeCV._id)}
            className="p-2 cursor-pointer text-muted-foreground hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      )}

      {/* HISTORY */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground">CV History</h2>
        </div>

        <div className="divide-y divide-border">

          {historyCVs.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No CVs uploaded yet
            </p>
          ) : (
            historyCVs.map((cv) => (
              <div key={cv._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-card hover:bg-muted/30 gap-3 transition-colors">

                {/* LEFT */}
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-muted-foreground" />

                  <div>
                    <h3 className="font-medium text-foreground text-md">
                      {cv.fileName}
                    </h3>

                    <p className="text-sm text-muted-foreground mt-0.5">
                      v{cv.version} · {cv.createdAt && new Date(cv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {cv.fileSize || "284 KB"}
                    </p>
                  </div>
                </div>


                  {/* ACTIONS */}
                <div className="w-full sm:w-auto flex items-center justify-end gap-3 border-t border-border/40 sm:border-0 pt-2 sm:pt-0 shrink-0">

                  {cv.isActive ? (
                    <span className="text-sm bg-status-success text-white px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                      <CheckCircle size={14} />
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActive(cv._id)}
                      className="border border-primary cursor-pointer text-foreground px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                    >
                      Set Active
                    </button>
                  )}

                  <button onClick={() => handleDelete(cv._id)} className="p-2 cursor-pointer text-muted-foreground hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
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