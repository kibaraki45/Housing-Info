import Head from "next/head";
import React, { useState } from "react";
import {
  Button,
  FormControl,
  MenuItem,
  TextField,
  IconButton,
  Autocomplete,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { Stack } from "@mui/system";
import { useRouter } from "next/router";
import RenderApplianceSelection from "../components/ApplianceRender";
import { MANUFACTURERS } from "../components/Manufacturers";

export default function ApplianceEntry() {
  const [appliances, setAppliances] = useState([
    { appliance_type: "", appliance_mfr: "", model_number: "" },
  ]);
  const [error, setError] = useState("");
  const router = useRouter();
  const APPLIANCE_CHOICES = [
    "Refrigerator/Freezer",
    "Cooker",
    "Washer",
    "Dryer",
    "TV",
  ];
  const postURL = "http://127.0.0.1:8000/add-appliance/";

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch(postURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: localStorage.getItem("email"),
        appliances: appliances,
      }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        if (status == 200) {
          setError("");
          router.push("/submission-complete");
        }
        setError(msg);
        console.log(status, msg);
      })
      .catch((err) => {
        console.error(err);
        setError("Problem connecting to database");
      });
  }

  function handleChangeAppliance(e, appIndex) {
    let temp = [...appliances];
    temp[appIndex] = {};

    temp[appIndex].appliance_type = e.target.value;
    temp[appIndex].appliance_mfr = "";
    temp[appIndex].model_number = "";

    switch (e.target.value) {
      case "Refrigerator/Freezer":
        temp[appIndex].refrigerator_type = "";
        break;
      case "Cooker":
        temp[appIndex].type = "";
        temp[appIndex].oven_type = "";
        temp[appIndex].oven_heatsrc = "";
        temp[appIndex].cooktop_heatsrc = "";
        break;
      case "Washer":
        temp[appIndex].load_type = "";
        break;
      case "Dryer":
        temp[appIndex].dryer_heat_source = "";
        break;
      case "TV":
        temp[appIndex].displayType = "";
        temp[appIndex].displaySize = "";
        temp[appIndex].maxRes = "";
        break;
    }
    setAppliances(temp);
  }

  function addAppliance(e) {
    let temp = [...appliances, { type: "" }];
    setAppliances(temp);
  }

  function removeAppliance(e) {
    if (appliances.length > 1) {
      let temp = appliances.filter((_, index) => index != e);
      setAppliances(temp);
    }
  }

  function onChange(type, val, appIndex) {
    let temp = [...appliances];
    temp[appIndex][type] = val;
    setAppliances(temp);
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Add New Appliances</h1>
      {appliances.map((appliance, appIndex) => (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          key={appIndex}
          mt={2}
        >
          <FormControl sx={{ minWidth: 250, maxWidth: 250 }}>
            <TextField
              value={appliance.appliance_type}
              label="Option"
              select
              onChange={(e) => handleChangeAppliance(e, appIndex)}
            >
              {APPLIANCE_CHOICES.map((choice, i) => (
                <MenuItem key={i} value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
            {appliances[appIndex].appliance_type != "" && (
              <>
                <Autocomplete
                  sx={{ mt: 1 }}
                  disablePortal
                  options={MANUFACTURERS}
                  value={appliances[appIndex].appliance_mfr}
                  onChange={(e, newValue) =>
                    onChange("appliance_mfr", newValue, appIndex)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Manufacturers" />
                  )}
                ></Autocomplete>
                <TextField
                  sx={{ mt: 1 }}
                  variant="outlined"
                  label="Model Number"
                  value={appliances[appIndex].model_number || ""}
                  onChange={(e) =>
                    onChange("model_number", e.target.value, appIndex)
                  }
                ></TextField>
              </>
            )}
          </FormControl>
          <RenderApplianceSelection
            onChange={onChange}
            appIndex={appIndex}
            appliances={appliances}
          />
          <IconButton size="small" onClick={addAppliance}>
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            value={appIndex}
            onClick={(e) => removeAppliance(appIndex)}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button sx={{ mt: 2 }} variant="outlined" onClick={handleSubmit}>
        Submit
      </Button>
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
