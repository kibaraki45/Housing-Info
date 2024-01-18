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

export default function avgTVDisplaySizeByState() {
  const tvInfo = [{ state: "California", average_display_size: 1 }];

  const [data, setData] = useState([]);

  // Link to get response data
  const getURL = "http://127.0.0.1:8000/avg-tv-display/";

  const tvGET = {
    method: "GET",
    mode: "cors",
  };
  // get postal info from GET
  const getTVInfo = async () => {
    fetch(getURL, tvGET)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
      }); //assign state to array res
  };

  useEffect(() => {
    getTVInfo();
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
      <h1 className="title">Average TV Display Size per State</h1>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>State</TableCell>
              <TableCell>Average Display Size (in.)</TableCell>
              <TableCell></TableCell>
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
                <TableCell>
                  <Button href={`/reports/tv-drilldown/${data[0]}`}>
                    Drilldown
                  </Button>
                </TableCell>
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
