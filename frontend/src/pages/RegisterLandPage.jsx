import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, MapPin, FileText, Check } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { landsAPI } from "../services/apiService";
import { useWallet } from "../context/WalletContext";
import LandMap from "../components/map/LandMap";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const RegisterLandPage = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    landType: "",
    areaSqFt: "",
    state: "",
    district: "",
    pincode: "",
    description: "",
    latitude: "",
    longitude: "",
    documentHash: "",
    ownerAddress: account || "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Location", icon: MapPin },
    { id: 3, title: "Document Upload", icon: Upload },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
    },
  });

  const uploadToIPFS = async () => {
    if (!uploadedFile) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", uploadedFile);

      const response = await fetch("/api/lands/upload", {
        method: "POST",
        body: formDataUpload,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        handleInputChange("documentHash", result.cid);

        // optional: store URL separately
        setUploadedFile({
          ...uploadedFile,
          url: result.url,
        });
      }
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("Document upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Build FormData for multipart/form-data
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title);
      submitFormData.append("landType", formData.landType);
      submitFormData.append("areaSqFt", formData.areaSqFt);
      submitFormData.append("state", formData.state);
      submitFormData.append("district", formData.district);
      submitFormData.append("pincode", formData.pincode);
      submitFormData.append("description", formData.description);
      submitFormData.append("latitude", formData.latitude);
      submitFormData.append("longitude", formData.longitude);
      submitFormData.append("documentHash", formData.documentHash);
      if (uploadedFile) {
        submitFormData.append("document", uploadedFile);
      }

      // POST /api/lands/register
      const res = await landsAPI.register(submitFormData);
      console.log("Land registered successfully:", res.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to register land:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
              currentStep >= step.id
                ? "bg-chain-cyan border-chain-cyan text-chain-dark"
                : "border-chain-border text-chain-muted"
            }`}
          >
            {currentStep > step.id ? (
              <Check size={20} />
            ) : (
              <step.icon size={20} />
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-2 ${
                currentStep > step.id ? "bg-chain-cyan" : "bg-chain-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-chain-text font-medium mb-2">
                Land Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                placeholder="Enter land title"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-chain-text font-medium mb-2">
                  Land Type
                </label>
                <select
                  value={formData.landType}
                  onChange={(e) =>
                    handleInputChange("landType", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
                  required
                >
                  <option value="">Select land type</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-chain-text font-medium mb-2">
                  Area (Sq Ft)
                </label>
                <input
                  type="number"
                  value={formData.areaSqFt}
                  onChange={(e) =>
                    handleInputChange("areaSqFt", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter area in square feet"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-chain-text font-medium mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter state"
                  required
                />
              </div>

              <div>
                <label className="block text-chain-text font-medium mb-2">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) =>
                    handleInputChange("district", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter district"
                  required
                />
              </div>

              <div>
                <label className="block text-chain-text font-medium mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter pincode"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-chain-text font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan resize-none"
                rows={4}
                placeholder="Enter land description"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-chain-text font-medium mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter latitude"
                  required
                />
              </div>

              <div>
                <label className="block text-chain-text font-medium mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
                  placeholder="Enter longitude"
                  required
                />
              </div>
            </div>

            <div className="h-96 rounded-xl overflow-hidden border border-chain-border">
              <LandMap
                lands={
                  formData.latitude && formData.longitude
                    ? [
                        {
                          latitude: parseFloat(formData.latitude),
                          longitude: parseFloat(formData.longitude),
                          title: formData.title || "Land Location",
                        },
                      ]
                    : []
                }
                center={
                  formData.latitude && formData.longitude
                    ? [
                        parseFloat(formData.latitude),
                        parseFloat(formData.longitude),
                      ]
                    : [20.5937, 78.9629]
                }
                zoom={formData.latitude && formData.longitude ? 12 : 5}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-chain-text font-medium mb-2">
                Owner Wallet Address
              </label>
              <input
                type="text"
                value={formData.ownerAddress}
                onChange={(e) =>
                  handleInputChange("ownerAddress", e.target.value)
                }
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan font-mono"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-chain-text font-medium mb-2">
                Document Upload
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-chain-cyan bg-chain-cyan/10"
                    : "border-chain-border hover:border-chain-cyan"
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto mb-4 text-chain-muted" />
                {uploadedFile ? (
                  <div>
                    <p className="text-chain-text font-medium">
                      {uploadedFile.name}
                    </p>
                    <p className="text-chain-muted text-sm">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-chain-text font-medium mb-2">
                      {isDragActive
                        ? "Drop the file here"
                        : "Drag & drop a document"}
                    </p>
                    <p className="text-chain-muted text-sm">
                      or click to browse (PDF, PNG, JPG up to 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {uploadedFile && !formData.documentHash && (
              <button
                onClick={uploadToIPFS}
                disabled={uploading}
                className="w-full px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium disabled:opacity-50"
              >
                {uploading ? "Uploading to IPFS..." : "Upload to IPFS"}
              </button>
            )}

            {formData.documentHash && (
              <div className="p-4 bg-chain-green/20 border border-chain-green rounded-lg">
                <p className="text-chain-green font-medium mb-2">
                  Document uploaded successfully!
                </p>

                <a
                  href={`https://gateway.pinata.cloud/ipfs/${formData.documentHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">
          Register New Land
        </h1>
        <p className="text-chain-muted">
          Complete the registration process in 3 simple steps
        </p>
      </div>

      {renderStepIndicator()}

      <div className="bg-chain-panel border border-chain-border rounded-xl p-8">
        <h2 className="text-xl font-orbitron text-chain-text mb-6">
          Step {currentStep}: {steps[currentStep - 1].title}
        </h2>

        {renderStepContent()}

        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-chain-border text-chain-text rounded-lg hover:bg-chain-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.documentHash}
              className="px-6 py-3 bg-chain-gold text-chain-dark rounded-lg hover:bg-yellow-600 transition-colors font-orbitron font-medium disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Register Land"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterLandPage;
