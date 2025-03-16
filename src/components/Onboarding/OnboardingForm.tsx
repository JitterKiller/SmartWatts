import React, { useState, useEffect } from 'react';
import InputGroup from '@/components/FormElements/InputGroup';
import CheckboxGroup from '@/components/FormElements/checkboxgroup';
import { ShowcaseSection } from '../Layouts/showcase-section';
import { Select } from '@/components/FormElements/select';
import { GlobeIcon } from "@/assets/icons";

interface OnboardingFormProps {
  onChange: (data: any) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onChange }) => {
  const [houseArea, setHouseArea] = useState<number | string>('');
  const [numberOfPersons, setNumberOfPersons] = useState<number | string>('');
  const [numberOfRooms, setNumberOfRooms] = useState<number | string>('');
  const [numberOfChildren, setNumberOfChildren] = useState<number | string>('');
  const [isACOn, setIsACOn] = useState(false);
  const [isTVOn, setIsTVOn] = useState(false);
  const [isUrban, setIsUrban] = useState(false);
  const [isFlat, setIsFlat] = useState(false);

  const formData = {
    houseArea: Number(houseArea),
    numberOfPersons: Number(numberOfPersons),
    numberOfRooms: Number(numberOfRooms),
    isACOn,
    isTVOn,
    isUrban,
    numberOfChildren: Number(numberOfChildren),
    isFlat,
  };

  // ✅ Prevent unnecessary updates (deep comparison)
  useEffect(() => {
    onChange(formData);
  }, [JSON.stringify(formData), onChange]); // ✅ Using JSON.stringify to compare deeply

  return (
    <ShowcaseSection title="Input Fields" className="space-y-5.5 !p-6.5">
      <Select
        label="Select your Region"
        items={[
          { label: "United States", value: "USA" },
          { label: "United Kingdom", value: "UK" },
          { label: "Switzerland", value: "CH" },
          { label: "Canada", value: "Canada" },
        ]}
        defaultValue=''
        prefixIcon={<GlobeIcon />}
        required
      />
      <InputGroup
        label="House Area Size"
        placeholder="Enter house area size"
        type="number"
        value={houseArea.toString()}
        handleChange={(e) => setHouseArea(e.target.value)}
        required
      />
      <InputGroup
        label="Number of Persons"
        placeholder="Enter number of persons"
        type="number"
        value={numberOfPersons.toString()}
        handleChange={(e) => setNumberOfPersons(e.target.value)}
        required
      />
      <InputGroup
        label="Number of Rooms"
        placeholder="Enter square feet"
        type="number"
        value={numberOfRooms.toString()}
        handleChange={(e) => setNumberOfRooms(e.target.value)}
        required
      />
        <InputGroup
            label="Number of Children"
            placeholder="Enter number of children"
            type="number"
            value={numberOfChildren.toString()}
            handleChange={(e) => setNumberOfChildren(e.target.value)}
            required
        />
      <CheckboxGroup
        label="Is AC On"
        checked={isACOn}
        onChange={(e) => setIsACOn(e.target.checked)}
      />
      <CheckboxGroup
        label="Is TV On"
        checked={isTVOn}
        onChange={(e) => setIsTVOn(e.target.checked)}
      />
      <CheckboxGroup
        label="Is your house urban?"
        checked={isUrban}
        onChange={(e) => setIsUrban(e.target.checked)}
      />
      <CheckboxGroup
        label="Is your house flat?"
        checked={isFlat}
        onChange={(e) => setIsFlat(e.target.checked)}
      />
    </ShowcaseSection>
  );
};

export default OnboardingForm;