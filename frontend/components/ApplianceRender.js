import { MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";

function RenderApplianceSelection({ onChange, appIndex, appliances }) {
  const FRIDGE_TYPE = [
    "Bottom Freezer Refrigerator",
    "French Door Refrigerator",
    "Side-by-Side Refrigerator",
    "Top Freezer Refrigerator",
    "Chest Freezer",
    "Upright Freezer",
  ];
  const COOKER_TYPE = ["Oven", "Cooktop"];
  const OVEN_HEAT_SOURCE = ["Gas", "Electric", "Microwave"];
  const OVEN_TYPE = ["Convection", "Conventional"];
  const COOKTOP_HEAT_SOURCE = [
    "Gas",
    "Electric",
    "Radiant Electric",
    "Induction",
  ];
  const WASHER_LOAD_TYPE = ["Top", "Front"];
  const DRYER_HEAT_SOURCE = ["Gas", "Electric", "None"];
  const DISPLAY_TYPE = ["Tube", "DLP", "Plasma", "LCD", "LED"];
  const TV_MAX_RES = [
    "480i",
    "576i",
    "720p",
    "1080i",
    "1080p",
    "1440p",
    "2160p (4K)",
    "4320p (8K)",
  ];
  const [cookerState, setCookerState] = useState([]);
  const [ovenState, setOvenState] = useState([]);

  useEffect(() => {
    return () => {
      if (appliances[appIndex].appliance_type != "Cooker") {
        setCookerState([]);
        setOvenState([]);
      }
    };
  }, [appliances[appIndex]]);

  function handleCookerChange(e, onChange, type, appIndex) {
    const {
      target: { value },
    } = e;
    setCookerState(value);
    onChange(type, value.toString(), appIndex);
  }

  function handleOvenChange(e, onChange, type, appIndex) {
    const {
      target: { value },
    } = e;
    setOvenState(value);
    onChange(type, value.toString(), appIndex);
  }

  function applianceRender(type, appIndex) {
    switch (type) {
      case "Refrigerator/Freezer":
        return (
          <TextField
            sx={{ minWidth: 250, maxWidth: 250 }}
            value={appliances[appIndex].refrigerator_type}
            label="Refrigerator Type"
            select
            onChange={(e) =>
              onChange("refrigerator_type", e.target.value, appIndex)
            }
          >
            {FRIDGE_TYPE.map((choice, i) => (
              <MenuItem key={i} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </TextField>
        );
      case "Cooker":
        return (
          <div>
            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Type"
              select
              value={cookerState}
              onChange={(e) =>
                handleCookerChange(e, onChange, "type", appIndex)
              }
              SelectProps={{ multiple: true }}
            >
              {COOKER_TYPE.map((choice, i) => (
                <MenuItem key={i} value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
            {cookerState.includes("Oven") && (
              <>
                <TextField
                  sx={{ ml: 1, minWidth: 250, maxWidth: 250 }}
                  variant="outlined"
                  label="Oven Heat Source"
                  select
                  value={ovenState}
                  onChange={(e) =>
                    handleOvenChange(e, onChange, "oven_heatsrc", appIndex)
                  }
                  SelectProps={{ multiple: true }}
                >
                  {OVEN_HEAT_SOURCE.map((choice, i) => (
                    <MenuItem key={i} value={choice}>
                      {choice}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  sx={{ ml: 1, minWidth: 250, maxWidth: 250 }}
                  value={appliances[appIndex].oven_type}
                  label="Oven Type"
                  select
                  onChange={(e) =>
                    onChange("oven_type", e.target.value, appIndex)
                  }
                >
                  {OVEN_TYPE.map((choice, i) => (
                    <MenuItem key={i} value={choice}>
                      {choice}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {cookerState.includes("Cooktop") && (
              <TextField
                sx={{ ml: 1, minWidth: 250, maxWidth: 250 }}
                value={appliances[appIndex].cooktop_heatsrc}
                label="Cooktop Heat Source"
                select
                onChange={(e) =>
                  onChange("cooktop_heatsrc", e.target.value, appIndex)
                }
              >
                {COOKTOP_HEAT_SOURCE.map((choice, i) => (
                  <MenuItem key={i} value={choice}>
                    {choice}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </div>
        );
      case "Washer":
        return (
          <TextField
            sx={{ minWidth: 250, maxWidth: 250 }}
            value={appliances[appIndex].load_type}
            label="Load Type"
            select
            onChange={(e) => onChange("load_type", e.target.value, appIndex)}
          >
            {WASHER_LOAD_TYPE.map((choice, i) => (
              <MenuItem key={i} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </TextField>
        );
      case "Dryer":
        return (
          <TextField
            sx={{ minWidth: 250, maxWidth: 250 }}
            value={appliances[appIndex].dryer_heat_source}
            label="Heat Source"
            select
            onChange={(e) =>
              onChange("dryer_heat_source", e.target.value, appIndex)
            }
          >
            {DRYER_HEAT_SOURCE.map((choice, i) => (
              <MenuItem key={i} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </TextField>
        );
      case "TV":
        return (
          <div>
            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              value={appliances[appIndex].displayType}
              label="Display Type"
              select
              onChange={(e) =>
                onChange("displayType", e.target.value, appIndex)
              }
            >
              {DISPLAY_TYPE.map((choice, i) => (
                <MenuItem key={i} value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              sx={{ ml: 1, minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Display Size"
              value={appliances[appIndex].displaySize || ""}
              onChange={(e) =>
                onChange("displaySize", e.target.value, appIndex)
              }
            ></TextField>
            <TextField
              sx={{ ml: 1, minWidth: 250, maxWidth: 250 }}
              value={appliances[appIndex].maxRes}
              label="Maximum Resolution"
              select
              onChange={(e) => onChange("maxRes", e.target.value, appIndex)}
            >
              {TV_MAX_RES.map((choice, i) => (
                <MenuItem key={i} value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
          </div>
        );
      default:
        return <div></div>;
    }
  }

  return applianceRender(appliances[appIndex].appliance_type, appIndex);
}

export default RenderApplianceSelection;
