import Head from "next/head";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
  AlertTitle,
  Paper,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function HouseholdAveragesReportResults() {
  const [data, setData] = useState([]);
  // optional alerts to display
  const ALERT_NONE = "";
  const ALERT_ERROR = "error";
  const ALERT_INFO = "info";
  const ALERT_SUCCESS = "success";
  const [alertSeverity, setAlertSeverity] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");

  const router = useRouter();
  const { postal, radius } = router.query;

  useEffect(() => {
    if (router.isReady) {
      fetch("http://127.0.0.1:8000/household-averages-report/", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postal: postal, radius: radius }),
      })
        .then((res) => {
          if (res.status == 204) {
            return { status: 204, body: "" };
          }
          return res
            .json()
            .then((data) => ({ status: res.status, body: data }));
        })
        .then((res) => {
          const status = res.status;
          const msg = res.body.message;

          console.log(res);
          if (status == 200) {
            setAlertMessage("");
            setData(res.body.data);
          } else if (status == 204) {
            setAlertMessage("No data found");
          } else {
            setAlertMessage(msg);
          }
        })
        .catch((err) => {
          console.error(err);
          setAlertMessage("Error accessing database");
        });
    }
  }, [router.isReady]);

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Household Averages by Radius Report</h1>

      {alertMessage.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}

      <div>
        <TableContainer component={Paper}>
          <Table className="searchParameters" sx={{ minWidth: 650 }}>
            <TableBody>
              <TableRow>
                <TableCell align="center" width="50%">
                  Postal Code: {postal}
                </TableCell>
                <TableCell align="center" width="50%">
                  Radius: {radius}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {alertMessage.length == 0 && (
          <TableContainer>
            <Table aria-label="simple table">
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.entry}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.val}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {userMessage && (
        <>
          <h3>{userMessage}</h3>
        </>
      )}

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
          width: 1/2;
        }
      `}</style>
    </div>
  );
}
