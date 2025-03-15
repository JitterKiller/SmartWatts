import React, { useState } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import { ShowcaseSection } from '../Layouts/showcase-section';

interface UploadSectionProps {
  onFileChange: (file: File | null) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileChange }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  return (
    <ShowcaseSection title="File upload" className="space-y-5 !py-6">
      <InputGroup
        type="file"
        fileStyleVariant="style1"
        label="Upload your Invoice"
        placeholder="Attach file"
        handleChange={handleFileChange}
      />
      {file && <p>Selected file: {file.name}</p>}
    </ShowcaseSection>
  );
};

export default UploadSection;