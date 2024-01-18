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

export default function fridgeFreezerReport() {
  const [number, setNumber] = useState([]);

  // Link to get response data
  const getFridgeURL = "http://127.0.0.1:8000/extra-fridge-count/";
  const fridgeInfo = {
    method: "GET",
    mode: "cors",
  };

  const [data, setData] = useState([]);
  const getURL = "http://127.0.0.1:8000/extra-fridge-report/";
  const fridgeFreezerReport = {
    method: "GET",
    mode: "cors",
  };

  useEffect(() => {
    fetch(getFridgeURL, fridgeInfo)
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;

        if (status == 200) {
          setNumber(res.body.data[0][0]);
        } else {
          console.log("error: display error message");
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err));
      });
  }, []);

  useEffect(() => {
    fetch(getURL, fridgeFreezerReport)
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;

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

  async function handleContinue(e) {
    //e.preventDefault()
    console.log("handleContinue");
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Fridge Freezer Report</h1>
      <h2> Total Households with Multiple Fridge/Freezers: {number}</h2>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>States</TableCell>
              <TableCell>Households with Multiple Fridge/Freezers</TableCell>
              <TableCell>Percentage of Chest Freezers</TableCell>
              <TableCell>Percentage of Upright Freezers</TableCell>
              <TableCell>Percentage of Other Freezers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((data, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {data[0]}
                </TableCell>
                <TableCell>{data[1]}</TableCell>
                <TableCell>{data[2]}%</TableCell>
                <TableCell>{data[3]}%</TableCell>
                <TableCell>{data[4]}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        href="/reports/"
        sx={{ mt: 2 }}
        variant="outlined"
        onClick={handleContinue}
      >
        Return to Reports
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
