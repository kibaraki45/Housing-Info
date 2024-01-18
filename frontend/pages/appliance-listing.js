/*
    PROBABLY WILL NOT BE USED.  APPLIANCE-ENTRY SHOWS ALL APPLIANCES AND ALLOWS YOU TO ADD MORE.
 */
import Head from "next/head";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { CompareSharp } from "@mui/icons-material";

export default function ApplianceListing() {
  const [data, setData] = useState([])
  const getURL = "http://127.0.0.1:8000/appliance-listing/";
  const reqOptions = {
    method: "GET",
    mode: "cors",
  }

  const getApplList = async () => {
    console.log("getApplData()");
    fetch(getURL, reqOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log(JSON.stringify(res))
        console.log("reult is[" + res["message"] + "]")
        if (res["message"] == "Success") {
          console.log("received 'Success'")
          console.log(JSON.stringify(res.data, null, 2))
          setData(res.data)
        } else {
          console.log("error: display error message")
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err))
      });
  };
  
  useEffect(() => {
    getApplList();
  }, []); 
  
  async function handleNext(e) {
    //e.preventDefault()
    console.log("handleSubmit")
  }

  async function handleAddAnother(e) {
    //e.preventDefault()
    console.log("handleAddAnother")
  }

  return (
      <div className="container">
        <Head>
          <title>Hemkraft Household Data</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <h1 className="title">Appliances</h1>

        <div>
          <h2>You have added the following appliances to your household:</h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Appliance #</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Model</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.appliance_entry}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.appliance_entry}
                    </TableCell>
                    <TableCell>{row.appliance_type}</TableCell>
                    <TableCell>{row.manufacturer_name}</TableCell>
                    <TableCell>{row.model_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

            <Button href="/appliance-entry/" sx={{ mt: 2 }} variant="text" onClick={handleAddAnother}>
              +Add another appliance
            </Button>
            <Button href="/submission-complete/" sx={{ mt: 2 }} variant="outlined" onClick={handleNext}>
              Next
            </Button>

        </div>

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
