import Head from "next/head";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  Radio,
  Alert,
  AlertTitle,
} from "@mui/material";
import { useState, useRef } from "react";
import { useRouter } from "next/router";

export default function HouseholdPhone() {
  const debug = false;
  const router = useRouter();
  // used to store form values as state
  const [yesNo, setYesNo] = useState("yes");
  const [areaCode, setAreaCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneType, setPhoneType] = useState("");
  // used to enable/disable form fields
  const [disabledAreaCode, setDisabledAreaCode] = useState(false);
  const [disabledPhoneNumber, setDisabledPhoneNumber] = useState(false);
  const [disabledPhoneType, setDisabledPhoneType] = useState(false);
  // used to enable/disable form fields as required
  const [requiredAreaCode, setRequiredAreaCode] = useState(true);
  const [requiredPhoneNumber, setRequiredPhoneNumber] = useState(true);
  const [requiredPhoneType, setRequiredPhoneType] = useState(true);
  // used to refer to form fields
  const refAreaCode = useRef();
  // optional alerts to display
  const ALERT_ERROR = "error";
  const ALERT_SUCCESS = "success";
  const [alertSeverity, setAlertSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  // allowed phone types
  const PHONE_TYPE = ["home", "mobile", "work", "other"];

  function handleChange(e) {
    const name = e.target["name"];
    const value = e.target["value"];
    if (debug) console.log("handleChange", name, value);
    if (name == "yes_no") {
      if (value == "no") {
        setAreaCode("");
        setPhoneNumber("");
        setPhoneType("");
        setDisabledAreaCode(true);
        setDisabledPhoneNumber(true);
        setDisabledPhoneType(true);
        setRequiredAreaCode(false);
        setRequiredPhoneNumber(false);
        setRequiredPhoneType(false);
      } else {
        setDisabledAreaCode(false);
        setDisabledPhoneNumber(false);
        setDisabledPhoneType(false);
        setRequiredAreaCode(true);
        setRequiredPhoneNumber(true);
        setRequiredPhoneType(true);
      }
      setYesNo(value);
    }

    if (name == "area_code") {
      if (isAreaCode(value)) {
        setAreaCode(value);
      }
    } else if (name == "phone_number") {
      if (isPhoneNumber(value)) {
        setPhoneNumber(value);
      }
    } else if (name == "phone_type") {
      setPhoneType(value);
    }
  }

  // validates "as user types"
  function isAreaCode(str) {
    if (str.length > 3) {
      return false;
    }
    for (var i = 0; i < str.length; i++) {
      if (str[i] < "0" || str[i] > "9") {
        return false;
      }
    }
    return true;
  }

  // validates "as user types"
  function isPhoneNumber(str) {
    if (str.length > 8) {
      return false;
    }
    var digits = 0;
    for (var i = 0; i < str.length; i++) {
      if (i == 3 && str[3] == "-") continue;
      if (str[i] < "0" || str[i] > "9") {
        return false;
      } else {
        digits++;
      }
      if (i == 7 && digits == 8) return false;
    }
    return true;
  }

  const postURL = "http://127.0.0.1:8000/add-phone/";
  const reqOptions = {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      area_code: areaCode,
      phone_number: phoneNumber,
      phone_type: phoneType,
    }),
  };

  // go to next page after success on adding phone
  // or if user declines to add a phone number
  const NEXT_PAGE_URL = "/household-entry/";

  async function handleNext(e) {
    console.log("handleNext");
    e.preventDefault();
    if (yesNo == "no" && areaCode === "" && phoneNumber === "") {
      localStorage.setItem("area_code", "");
      localStorage.setItem("phone_number", "");
      localStorage.setItem("phone_type", "");
      router.push(NEXT_PAGE_URL);
      return true;
    }
    await fetch(postURL, reqOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res["message"] == "Success") {
          localStorage.setItem("area_code", res.area_code);
          localStorage.setItem("phone_number", res.phone_number);
          localStorage.setItem("phone_type", res.phone_type);
          router.push(NEXT_PAGE_URL);
        } else {
          setAlertSeverity(ALERT_ERROR);
          setAlertMessage(res["message"]);
        }
      })
      .catch((err) => {
        setAlertSeverity(ALERT_ERROR);
        setAlertMessage("network/server error:" + err);
      });
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Enter Household Info</h1>

      {alertMessage && (
        <>
          <Alert severity={alertSeverity} sx={{ mt: 2 }}>
            <AlertTitle>{alertSeverity}</AlertTitle>
            {alertMessage}
          </Alert>
        </>
      )}

      <FormControl>
        <FormLabel>Would you like to enter a phone number?</FormLabel>
        <RadioGroup
          name="yes_no"
          value={yesNo}
          defaultValue="yes"
          row
          onChange={handleChange}
        >
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        <FormLabel>Area code</FormLabel>
        <TextField
          name="area_code"
          value={areaCode}
          disabled={disabledAreaCode}
          ref={refAreaCode}
          sx={{ minWidth: 120, maxWidth: 120 }}
          variant="outlined"
          onChange={handleChange}
        ></TextField>

        <FormLabel>Number</FormLabel>
        <TextField
          name="phone_number"
          value={phoneNumber}
          disabled={disabledPhoneNumber}
          sx={{ minWidth: 125, maxWidth: 125 }}
          variant="outlined"
          onChange={handleChange}
        ></TextField>

        <FormLabel>Phone type</FormLabel>
        <Select
          name="phone_type"
          value={phoneType}
          disabled={disabledPhoneType}
          onChange={handleChange}
        >
          {PHONE_TYPE.map((choice, i) => (
            <MenuItem key={i} value={choice}>
              {choice}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button sx={{ mt: 2 }} variant="outlined" onClick={handleNext}>
        Next
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
