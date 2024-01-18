import Head from "next/head";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import React, { useState, useEffect } from "react";

export default function bathroomListing() {
  const [data, setData] = useState([]);
  const getURL = "http://127.0.0.1:8000/get-all-baths/";

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
          setData(res.body.data);
        } else {
          console.log("error: display error message");
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err));
      });
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Bathroom Listing</h1>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Bathroom Number</TableCell>
              <TableCell>Bathroom Type</TableCell>
              <TableCell>Primary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row[0]}
                </TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell>{row[2] == 1 ? "Yes" : ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button href="/bathroom-entry/">Add Another Bathroom</Button>
      <Button href="/appliance-entry/">Next</Button>

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
