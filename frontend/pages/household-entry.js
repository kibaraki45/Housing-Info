import { Alert, Button, Grid, MenuItem, TextField } from "@mui/material";
import { Stack } from "@mui/system";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function HouseholdEntry() {
  const router = useRouter();
  const [home, setHome] = useState([
    {
      household_type: "",
      square_footage: "",
      occupants: "",
      num_bedrooms: "",
    },
  ]);
  const [error, setError] = useState("");
  const postURL = "http://127.0.0.1:8000/add-house-info/";

  const HOME_TYPE = [
    "House",
    "Apartment",
    "Townhome",
    "Condominium",
    "Mobile Home",
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    const send = {
      email: localStorage.getItem("email"),
      postal_zip: localStorage.getItem("postal_zip"),
      area_code: localStorage.getItem("area_code"),
      phone_number: localStorage.getItem("phone_number"),
      phone_type: localStorage.getItem("phone_type"),
      household_type: home[0].household_type.toLowerCase(),
      square_footage: home[0].square_footage,
      occupants: home[0].occupants,
      num_bedrooms: home[0].num_bedrooms,
    };

    await fetch(postURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(send),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        if (status == 200) {
          setError("");
          router.push("/bathroom-entry");
        } else setError(msg);
      })
      .catch((err) => {
        console.log(err);
        setError("Problem connecting to database");
      });
  }

  function handleChange(type, e) {
    let temp = [...home];
    temp[0][type] = e.target.value;
    setHome(temp);
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Household Entry</h1>
      {error.length > 0 && (
        <Alert sx={{ mt: 2, mb: 2 }} severity="error">
          {error}
        </Alert>
      )}
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={6} align="right">
          <p>Home Type</p>
        </Grid>
        <Grid item xs={6}>
          <TextField
            sx={{ minWidth: 200 }}
            value={home[0].household_type}
            error={error.msg == "Invalid household type!"}
            label="Home Type"
            select
            onChange={(e) => handleChange("household_type", e)}
          >
            {HOME_TYPE.map((v, i) => (
              <MenuItem key={i} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} align="right">
          <p>Square Footage</p>
        </Grid>
        <Grid item xs={6}>
          <TextField
            sx={{ minWidth: 200 }}
            value={home[0].square_footage}
            error={error.msg == "Inputs cannot be zero!"}
            label="Square Footage"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) => handleChange("square_footage", e)}
          ></TextField>
        </Grid>
        <Grid item xs={6} align="right">
          <p>Occupants</p>
        </Grid>
        <Grid item xs={6}>
          <TextField
            sx={{ minWidth: 200 }}
            value={home[0].occupants}
            error={error.msg == "Inputs cannot be zero!"}
            label="Occupants"
            type="number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) => handleChange("occupants", e)}
          ></TextField>
        </Grid>
        <Grid item xs={6} align="right">
          <p>Bedrooms</p>
        </Grid>
        <Grid item xs={6}>
          <TextField
            sx={{ minWidth: 200 }}
            value={home[0].num_bedrooms}
            error={error.msg == "Inputs cannot be zero!"}
            label="Bedrooms"
            type="number"
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) => handleChange("num_bedrooms", e)}
          ></TextField>
        </Grid>
      </Grid>
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
