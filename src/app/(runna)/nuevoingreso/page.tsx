"use client";

import React, { useState } from "react";
import MultiStepForm, { type FormData } from "@/components/forms/MultiStepForm";
import { Button, Box } from "@mui/material";

const Page: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data);
    setFormData(data);
    setIsEditing(false);
  };

  const initialData: FormData = {
    name: "John Doe",
    email: "john@example.com",
    street: "123 Main St",
    city: "Anytown",
    country: "USA",
    subscribe: true,
    comments: "This is a sample comment.",
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Multi-Step Form Example</h1>
      {!formData && !isEditing && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Create New Form
          </Button>
          <Button variant="contained" onClick={() => setFormData(initialData)}>
            Load Sample Data
          </Button>
        </Box>
      )}
      {isEditing && <MultiStepForm onSubmit={handleSubmit} initialData={formData || undefined} />}
      {formData && !isEditing && (
        <>
          <MultiStepForm onSubmit={() => {}} initialData={formData} readOnly />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => setIsEditing(true)}>
              Edit Form
            </Button>
          </Box>
        </>
      )}
    </div>
  );
};

export default Page;
