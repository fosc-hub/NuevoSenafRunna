"use client"

import React, { useState } from "react";
import MultiStepForm, { type FormData } from "@/components/forms/MultiStepForm";
import { Button, Box } from "@mui/material";

const Page: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSubmit = (data: FormData) => {
    console.log("Form data:", data)
    setFormData(data)
    setIsEditing(false)
  }

  const initialData: FormData = {
    name: "John Doe",
    email: "john@example.com",
    street: "123 Main St",
    city: "Anytown",
    country: "USA",
    subscribe: true,
    comments: "This is a sample comment.",
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {isEditing || !formData ? (
            <MultiStepForm onSubmit={handleSubmit} initialData={formData || initialData} />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Submitted Data:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">{JSON.stringify(formData, null, 2)}</pre>
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Edit Submission
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page

