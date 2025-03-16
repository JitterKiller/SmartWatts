"use client";

import React, { useState, useCallback, useEffect } from "react";
import OnboardingForm from "@/components/Onboarding/OnboardingForm";
import UploadSection from "@/components/Onboarding/UploadSection";
import { Button } from "@/components/ui-elements/button";
import { SettingsIcon } from "@/components/Layouts/header/user-info/icons";
import Modal from "@/components/ui/modal";
import { useRouter } from "next/navigation"; // ✅ Import Next.js router

interface FormData {
  houseArea: number;
  numberOfPersons: number;
  numberOfChildren: number;
  numberOfRooms: number;
  isACOn: boolean;
  isTVOn: boolean;
  isUrban: boolean;
  isFlat: boolean;
}

const OnboardingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    houseArea: 0,
    numberOfPersons: 0,
    numberOfChildren: 0,
    numberOfRooms: 0,
    isACOn: false,
    isTVOn: false,
    isUrban: false,
    isFlat: false,
  });

  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  // ✅ Function to update form fields dynamically
  const handleFormChange = useCallback((data: FormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ✅ Handle file upload
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  // ✅ Check if all required fields are filled before enabling the button
  useEffect(() => {
    const isFormFilled = Object.values(formData).every(
      (value) => typeof value === "boolean" || (typeof value === "number" && value > 0)
    );

    setIsButtonDisabled(!(isFormFilled && file !== null));
  }, [formData, file]);

  // ✅ Handle button click & send form data to Python API
  const handleButtonClick = async () => {
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    setLoading(true); // ✅ Start loading

    await new Promise((resolve) => setTimeout(resolve, 10)); // ✅ Ensure state update is reflected

    const formDataWithFile = new FormData();
    formDataWithFile.append("file", file);
    Object.entries(formData).forEach(([key, value]) => {
      formDataWithFile.append(key, value.toString());
    });

    fetch("http://localhost:5001/api", {
        method: "POST",
        body: formDataWithFile,
        headers: {
          "Accept": "application/json",  // ✅ Ensure JSON response
        },
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status} - ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Success:", data);
          router.push("http://localhost:3000");
        })
        .catch((error) => {
          console.error("Error fetching API:", error);
        }).finally(() => {
            setLoading(false); // ✅ Stop loading
        });
      
  };

  return (
    <div>
      <div className="py-6">
        <UploadSection onFileChange={handleFileChange} />
      </div>

      <OnboardingForm onChange={handleFormChange} />

      <div className="py-6 flex justify-center">
        <Button
          label={loading ? "Processing..." : "Analyze Now"} // ✅ Show loader text
          variant="outlinePrimary"
          shape="rounded"
          size="default"
          icon={<SettingsIcon />}
          className="py-4 px-8 text-lg"
          onClick={handleButtonClick}
          {...(isButtonDisabled ? { disabled: true } : {})} // ✅ Correct way to pass disabled prop
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Analysis Result</h2>
        <pre>{apiResponse}</pre>
      </Modal>
    </div>
  );
};

export default OnboardingPage;
