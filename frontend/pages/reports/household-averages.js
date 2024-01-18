import Head from "next/head";
import {
  Button,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function HouseholdAveragesReport() {
  const debug = true;
  const router = useRouter();
  const [postal, setPostal] = useState("");
  const [radius, setRadius] = useState("");
  // optional alerts to display
  const ALERT_NONE = "";
  const ALERT_ERROR = "error";
  const ALERT_INFO = "info";
  const ALERT_SUCCESS = "success";
  const [alertSeverity, setAlertSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const getURL = "http://127.0.0.1:8000/household-averages-report/"; //need two params here ?postal=95401&radius=5
  const reqOptions = {
    method: "GET",
    mode: "cors",
  };

  const RADIUS = ["0", "5", "10", "25", "50", "100", "250"];

  async function handleViewReport(e) {
    console.log("handleViewReport");
    e.preventDefault();
    if (postal == "" || radius == "") {
      setAlertSeverity(ALERT_ERROR);
      setAlertMessage("Both PostalCode and Radius are required");
      return true;
    }

    verifyPostal();
  }

  async function verifyPostal() {
    await fetch("http://127.0.0.1:8000/verify-postal/", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postal_code: postal }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;

        if (status == 200) {
          setAlertMessage("");
          router.push(
            "/reports/household-averages-results/?postal=" +
              postal +
              "&radius=" +
              radius
          );
        } else {
          setAlertMessage(msg);
        }
      })
      .catch((err) => {
        console.error(err);
        setAlertMessage(err);
      });
  }

  async function handlePostal(e) {
    if (isPostalCode(e.target.value)) {
      setPostal(e.target.value);
    }
  }

  async function handleRadius(e) {
    setRadius(e.target.value);
  }

  // validates "as user types"
  function isPostalCode(str) {
    if (str.length > 5) {
      return false;
    }
    for (const i of str) {
      if (i < "0" || i > "9") {
        return false;
      }
    }
    return true;
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Household Averages by Radius</h1>

      <div>
        {alertMessage && (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {alertMessage}
            </Alert>
          </>
        )}
      </div>

      <div>
        <FormControl>
          <FormLabel>Postal Code</FormLabel>
          <TextField
            name="postal"
            value={postal}
            sx={{ minWidth: 120, maxWidth: 120 }}
            variant="outlined"
            onChange={handlePostal}
          ></TextField>

          <FormLabel>Radius</FormLabel>
          <Select name="radius" value={radius} onChange={handleRadius}>
            {RADIUS.map((choice, i) => (
              <MenuItem key={i} value={choice}>
                {choice}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <Button
        sx={{ mt: 2 }}
        variant="contained"
        color="success"
        onClick={handleViewReport}
      >
        View Report
      </Button>

      <br></br>
      <br></br>
      <Button href="/reports/" sx={{ mt: 2 }} variant="outlined">
        Return to Reports
      </Button>
      <Button href="/" sx={{ mt: 2 }} variant="outlined">
        Return to Main Menu
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
