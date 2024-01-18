import {
  Alert,
  AlertTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormLabel,
  Box,
} from "@mui/material";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import Router, { withRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function postalCodeConfirmation() {
  // get postal data from previous page
  const router = useRouter();
  const postalCode =
    typeof router.query.data === "undefined"
      ? null
      : JSON.parse(router.query.data);
  const [data, setData] = useState([]);

  // Link to get response data
  const getURL = "http://127.0.0.1:8000/verify-postal/";

  const postalInfo = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      postal_code: postalCode,
    }),
  };
  // get postal info from POST
  const getPostalInfo = async () => {
    fetch(getURL, postalInfo)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
      }); //assign state to array res
  };

  useEffect(() => {
    getPostalInfo();
  }, []);

  const postURL = "http://127.0.0.1:8000/confirm-postal/";

  const postalInfoConfirm = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      confirm: "True",
      postal_code: postalCode,
    }),
  };

  const postalInfoDiscard = {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      confirm: "False",
      postal_code: postalCode,
    }),
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (e.target.value == "no") Router.push({ pathname: "/postalcode-entry/" });
    else if (e.target.value == "yes") {
      localStorage.setItem("postal_zip", postalCode);
      Router.push({ pathname: "/household-phone/" });
    }
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Create Household</h1>
      <h2>Is the Following Information Correct? </h2>
      <FormLabel> {data.zip}</FormLabel>
      <FormLabel>
        {" "}
        {data.city}, {data.state}
      </FormLabel>

      <Box
        component="span"
        m={1}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          value="yes"
          onClick={handleSubmit}
        >
          Yes
        </Button>

        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          value="no"
          onClick={handleSubmit}
        >
          No
        </Button>
      </Box>

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
