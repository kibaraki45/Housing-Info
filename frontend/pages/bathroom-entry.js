import Head from "next/head";
import {
  Button,
  FormControl,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function bathroomEntry() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [flag, setFlag] = useState("False");
  const [name, setName] = useState("");

  const router = useRouter();

  // used to find if primary exists
  const getURL = "http://127.0.0.1:8000/get-primary-bath/";

  const [primary, setPrimary] = useState([]);
  useEffect(() => {
    fetch(getURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: localStorage.getItem("email") }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;

        console.log(res);
        if (status == 200) {
          setPrimary(res.body.primary_exists);
        } else {
          console.log("error: display error message");
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err));
      });
  }, []);
  // use state to hold bathroom information
  const [bathroom, setBathroom] = useState({
    bathroom_type: "",
    sinks: "",
    commodes: "",
    bidet: "",
    half_name: "",
    bathtub_count: "",
    shower_count: "",
    tub_shower_count: "",
    primary: "",
  });

  const BATHROOM_TYPE = ["Full", "Half"];

  // POST Set up
  const postURL = "http://127.0.0.1:8000/add-bathroom/";

  const fullBathJSON = {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      bathroom_type: bathroom.bathroom_type.toLowerCase(),
      sinks: bathroom.sinks,
      commodes: bathroom.commodes,
      bidets: bathroom.bidet,
      bathtub_count: bathroom.bathtub_count,
      shower_count: bathroom.shower_count,
      tub_shower_count: bathroom.tub_shower_count,
      primary: flag,
    }),
  };

  const halfBathJSON = {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bathroom_type: bathroom.bathroom_type.toLowerCase(),
      sinks: bathroom.sinks,
      commodes: bathroom.commodes,
      bidets: bathroom.bidet,
      half_name: name,
    }),
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (bathroom.bathroom_type == "Half") {
      console.log(halfBathJSON);
      await fetch(postURL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
          bathroom_type: bathroom.bathroom_type.toLowerCase(),
          sinks: bathroom.sinks,
          commodes: bathroom.commodes,
          bidets: bathroom.bidet,
          half_name: name,
        }),
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, body: data }))
        )
        .then((res) => {
          const status = res.status;
          const msg = res.body.message;

          if (msg == "Inputs cannot be negative numbers!" || 
             msg == "A bathroom must have at least one of the following: sinks, commodes, bidets!" )
          {
            setError(msg)
          }
       
        
          if (status == 200) {
          
            router.push("/bathroom-listing");
          } else {
            setError(msg);
          }
        })
        .catch((err) => {
          setError(err);
        });
    } else if (bathroom.bathroom_type == "Full") {
      console.log(fullBathJSON);
      await fetch(postURL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: localStorage.getItem("email"),
          bathroom_type: bathroom.bathroom_type.toLowerCase(),
          sinks: bathroom.sinks,
          commodes: bathroom.commodes,
          bidets: bathroom.bidet,
          bathtub_count: bathroom.bathtub_count,
          shower_count: bathroom.shower_count,
          tub_shower_count: bathroom.tub_shower_count,
          primary_flag: flag,
        }),
      })
        .then((res) =>
          res.json().then((data) => ({ status: res.status, body: data }))
        )
        .then((res) => {
          const status = res.status;
          const msg = res.body.message;

          if (msg == "Inputs cannot be negative numbers!" || 
          msg == "A bathroom must have at least one of the following: sinks, commodes, bidets!" ||
          msg == "A full bathroom must have at least one of the following: bathtub, shower, tub/shower!")
       {
         setError(msg)
       }


          if (status == 200) {
            console.log("success: phone accepted by database");
            // on success, do not display anything, navigate to the next page
            router.push("/bathroom-listing");
          } else {
            setError(msg);
            // display an error message
          }
        })
        .catch((err) => {
          console.log("misc error:", JSON.stringify(err));
          setError(err);
        });
    }
  }

  const handleChange = (e) => {
    const name = e.target["name"];
    // const value = e.target["value"]

    if (name == "bathroom_type") {
      bathroom.bathroom_type = "";
      bathroom.sinks = "";
      bathroom.commodes = "";
      bathroom.bidet = "";
      bathroom.half_name = "";
      bathroom.bathtub_count = "";
      bathroom.shower_count = "";
      bathroom.tub_shower_count = "";
      bathroom.primary = "";
    }

    setBathroom({
      ...bathroom,
      [e.target.name]: e.target["value"],
    });
  };

  const handleChecked = (e) => {
    if (e.target.checked) {
      setFlag("True");
    } else {
      setFlag("False");
    }
  };

  const handleName = (e) => {
    setName(e.target.value);
  };

  function BathroomRender(type) {
    switch (type) {
      case "Half":
        return (
          <div>
            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Sinks"
              type="number"
              name="sinks"
              margin="dense"
              defaultValue= {"0"}
              onChange={handleChange}
              value={bathroom.sinks}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Commodes"
              type="number"
              margin="dense"
              name="commodes"
              onChange={handleChange}
              value={bathroom.commodes}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Bidets"
              type="number"
              margin="dense"
              name="bidet"
              onChange={handleChange}
              value={bathroom.bidet}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Name (Optional)"
              name="name"
              margin="dense"
              type="string"
              onChange={handleName}
            ></TextField>
          </div>
        );

      case "Full":
        return (
          <div>
            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Sink"
              type="number"
              name="sinks"
              margin="dense"
              onChange={handleChange}
              value={bathroom.sinks}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Commodes"
              type="number"
              name="commodes"
              margin="dense"
              onChange={handleChange}
              value={bathroom.commodes}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Bidets"
              type="number"
              margin="dense"
              name="bidet"
              onChange={handleChange}
              value={bathroom.bidet}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Bathtubs"
              type="number"
              name="bathtub_count"
              margin="dense"
              onChange={handleChange}
              value={bathroom.bathtub_count}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Showers"
              type="number"
              margin="dense"
              name="shower_count"
              onChange={handleChange}
              value={bathroom.shower_count}
            ></TextField>

            <TextField
              sx={{ minWidth: 250, maxWidth: 250 }}
              variant="outlined"
              label="Tub/Showers"
              type="number"
              min="0"
              margin="dense"
              name="tub_shower_count"
              onChange={handleChange}
              value={bathroom.tub_shower_count}
            ></TextField>

            <FormGroup>
              <FormControlLabel
                control={<Checkbox />}
                disabled={primary == true}
                label="Primary Bathroom"
                name="name"
                onChange={handleChecked}

              />
            </FormGroup>
          </div>
        );
      default:
        return <div></div>;
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Enter Household Info</h1>
      {error.length > 0 && <Alert severity="error">{error}</Alert>}

      <FormControl>
        <FormLabel id="label_full">Enter Bathroom Type</FormLabel>
        <Select
          id="bathroom_type"
          name="bathroom_type"
          value={bathroom.bathroom_type}
          onChange={handleChange}
        >
          {BATHROOM_TYPE.map((choice, i) => (
            <MenuItem key={i} value={choice}>
              {choice}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {BathroomRender(bathroom.bathroom_type)}

      <Button
        disabled={bathroom.bathroom_type == ""}
        sx={{ mt: 2 }}
        variant="outlined"
        onClick={handleSubmit}
      >
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
