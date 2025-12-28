import type React from "react"
import { Box } from "@mui/material"

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  /**
   * Optional padding top in pixels
   * @default undefined (no padding)
   */
  paddingTop?: number | string
  /**
   * Whether to wrap children in MUI Box component
   * @default true
   */
  wrapInBox?: boolean
  /**
   * ID prefix for accessibility attributes
   * @default "tabpanel"
   */
  idPrefix?: string
}

/**
 * Shared TabPanel component for MUI Tabs
 *
 * Consolidates 3 duplicate implementations:
 * - src/components/evaluacion/tab-panel.tsx
 * - src/components/forms/components/tab-panel.tsx
 * - Inline function in src/components/asignarModal.tsx
 *
 * @example
 * // Basic usage (with Box wrapper, no padding)
 * <TabPanel value={tabValue} index={0}>
 *   <Typography>Tab content</Typography>
 * </TabPanel>
 *
 * @example
 * // With padding
 * <TabPanel value={tabValue} index={0} paddingTop={16}>
 *   <Typography>Tab content</Typography>
 * </TabPanel>
 *
 * @example
 * // Without Box wrapper
 * <TabPanel value={tabValue} index={0} wrapInBox={false}>
 *   <Typography>Tab content</Typography>
 * </TabPanel>
 */
const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  paddingTop,
  wrapInBox = true,
  idPrefix = "tabpanel",
  ...other
}) => {
  const content = wrapInBox ? <Box>{children}</Box> : children

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${idPrefix}-${index}`}
      aria-labelledby={`${idPrefix === "simple-tabpanel" ? "simple-tab" : idPrefix.replace("tabpanel", "tab")}-${index}`}
      {...other}
      style={paddingTop !== undefined ? { paddingTop } : undefined}
    >
      {value === index && content}
    </div>
  )
}

export default TabPanel
