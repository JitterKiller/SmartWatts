"use client";

import React, { useState , useCallback} from "react";
import OnboardingForm from "@/components/Onboarding/OnboardingForm";
import UploadSection from "@/components/Onboarding/UploadSection";
import { Button } from "@/components/ui-elements/button";
import { SettingsIcon } from "@/components/Layouts/header/user-info/icons";
import Modal from "@/components/ui/modal";

interface FormData {
  houseArea: number;
  numberOfPersons: number;
  squareFeet: number;
  isACOn: boolean;
  isTVOn: boolean;
  isUrban: boolean;
  isFlat: boolean;
}

const OnboardingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    houseArea: 0,
    numberOfPersons: 0,
    squareFeet: 0,
    isACOn: false,
    isTVOn: false,
    isUrban: false,
    isFlat: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFormChange = useCallback((data: FormData) => {
    setFormData((prev) => ({ ...prev, ...data })); // ✅ Only update changed fields
  }, []);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleButtonClick = () => {
    if (!file) {
      alert("Please upload a file.");
      return;
    }
  
    const formDataWithFile = new FormData();
    formDataWithFile.append('file', file);
  
    fetch('http://localhost:5001/api/upload', {
      method: 'POST',
      body: formDataWithFile,
      headers: {
        'Accept': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        alert(`File uploaded: ${data.fileUrl}`);
      })
      .catch(error => {
        console.error('Error:', error);
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
          label="Analyze Now"
          variant="outlinePrimary"
          shape="rounded"
          size="default"
          icon={<SettingsIcon />}
          className="py-4 px-8 text-lg"
          onClick={handleButtonClick}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>Form Data</h2>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </Modal>
    </div>
  );
};

export default OnboardingPage;