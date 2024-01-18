import Head from "next/head";
import { Button, TextField, Alert } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Router, { withRouter } from "next/router";

export default function CreatePostalCode() {
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState("");
  const postURL = "http://127.0.0.1:8000/verify-postal/";
  const router = useRouter();

  function onChange(e) {
    if (isPostalCode(e.target.value)) {
      setPostalCode(e.target.value);
    }
  }

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

  async function handleSubmit(e) {
    e.preventDefault();

    await fetch(postURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postal_code: postalCode }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        if (msg == "Postal code is incorrect length!") {
          setError(msg);
        }

        if (status == 200) {
          setError("");
          Router.push(
            {
              pathname: "/postal-code-confirmation/",
              query: { data: JSON.stringify(postalCode) },
            },
            "/postal-code-confirmation/"
          );
        } else {
          setError(msg);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Create Household</h1>
      <h3>Enter your Postal Code</h3>
      {error.length > 0 && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          sx={{ minWidth: 250, maxWidth: 250 }}
          error={error.length > 0}
          variant="outlined"
          type="number"
          value={postalCode}
          onChange={onChange}
        ></TextField>
      </form>
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
