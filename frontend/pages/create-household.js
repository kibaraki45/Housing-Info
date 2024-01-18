import Head from "next/head";
import { Alert, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CreateHousehold() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const postURL = "http://127.0.0.1:8000/verify-email/";
  const router = useRouter();

  function onChange(e) {
    setEmail(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch(postURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        if (status == 200) {
          setError("");
          localStorage.setItem("email", res.body.email);
          console.log(res);
          router.push("/postalcode-entry");
        }
        if (status != 200) setError(msg);
      })
      .catch((err) => {
        console.error(err);
        setError("Problem connecting to database");
      });
  }

  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Create Household</h1>
      <h3>Enter your Email</h3>
      {error.length > 0 && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          sx={{ mt: 2, minWidth: 250, maxWidth: 250 }}
          error={error.length > 0}
          variant="outlined"
          label="Email"
          value={email}
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
