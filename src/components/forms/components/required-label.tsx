import React from "react"

interface RequiredLabelProps {
  label: string
}

const RequiredLabel: React.FC<RequiredLabelProps> = ({ label }) => (
  <React.Fragment>
    {label} <span style={{ color: "#d32f2f" }}>*</span>
  </React.Fragment>
)

export default RequiredLabel
