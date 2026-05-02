"use client";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { NotificationType } from "@/lib/notifications";

interface Props {
  value: NotificationType;
  onChange: (v: NotificationType) => void;
}

const TYPES: NotificationType[] = ["All", "Placement", "Result", "Event"];

export default function FilterBar({ value, onChange }: Props) {
  return (
    <Box sx={{ mb: 2 }}>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => { if (v) onChange(v); }}
        size="small"
        sx={{ flexWrap: "wrap", gap: "6px" }}
      >
        {TYPES.map((t) => (
          <ToggleButton
            key={t}
            value={t}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.82rem",
              borderRadius: "20px !important",
              border: "1px solid #ddd !important",
              px: 2,
              py: 0.5,
              "&.Mui-selected": {
                backgroundColor: "#1a3a5c",
                color: "#fff",
                "&:hover": { backgroundColor: "#14304f" },
              },
            }}
          >
            {t}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
