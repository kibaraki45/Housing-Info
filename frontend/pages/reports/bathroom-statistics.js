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
  Alert,
  AlertTitle
} from "@mui/material";
import React, { useState, useEffect } from "react";

export default function BathroomStatisticsReport() {
  const [statTable, setTable] = useState([])
  const [stateMostBidets, setStateMostBidets] = useState("")
  const [mostStateBidets, setMostStateBidets] = useState("")
  const [postalMostBidets, setPostalMostBidets] = useState("")
  const [mostPostalBidets, setMostPostalBidets] = useState("")
  const [singlePrimaryBathrooms, setSinglePrimaryBathrooms] = useState("")
  
  // optional alerts to display
  const ALERT_NONE = ""
  const ALERT_ERROR = "error"
  const ALERT_INFO = "info"
  const ALERT_SUCCESS = "success"
  const [alertSeverity, setAlertSeverity] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [userMessage, setUserMessage] = useState("")

  const getURL = "http://127.0.0.1:8000/bathroom-statistics-report/"
  const reqOptions = {
    method: "GET",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
  }

  const getReportData = async () => {
    console.log("getReportData()");
    fetch(getURL, reqOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log(JSON.stringify(res))
        console.log("reult is[" + res["message"] + "]")
        if (res["message"] == "Success") {
          console.log("success: received success from Flask server")
          console.log(JSON.stringify(res.data, null, 2))
          setTable(res.data.statTable)
          console.log(res.data)
          setStateMostBidets(res.data.state_most_bidets)
          setMostStateBidets(res.data.most_state_bidets)
          setPostalMostBidets(res.data.postal_most_bidets)
          setMostPostalBidets(res.data.most_postal_bidets)
          setSinglePrimaryBathrooms(res.data.single_primary_bathrooms)
          if (res.data.statTable.length == 0) {
            console.log("data is size zero")
            setUserMessage("No data to display")
          }          
          if (res.data.state_most_bidets == "") {
            setStateMostBidets("NO DATA")
            setMostStateBidets("NO DATA")
          }
          if (res.data.postal_most_bidets == "") {
            setPostalMostBidets("NO DATA")
            setMostPostalBidets("NO DATA")
          }
          if (res.data.single_primary_bathrooms == "") {
            setSinglePrimaryBathrooms("NO DATA")
          }
        } else {
          console.log("error: display error message")
          setAlertSeverity(ALERT_ERROR)
          setAlertMessage(res["message"])             
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err))
        setAlertSeverity(ALERT_ERROR)
        setAlertMessage("misc error:" + err)            
      });
  };

  useEffect(() => {
    console.log("useEffect()")
    setAlertSeverity(ALERT_NONE)
    setAlertMessage("")    
    getReportData();
  }, []);
  
  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Bathroom Statistics Report</h1>

      <div>
        {alertMessage && (
          <>
            <Alert severity={alertSeverity} sx={{ mt: 2 }}>
              <AlertTitle>{alertSeverity}</AlertTitle>
              {alertMessage}
            </Alert>
          </>
        )}
      </div>

      <div>
        <h2>Bathroom MIN/AVG/MAX statistics</h2>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Min</TableCell>
                <TableCell>Avg</TableCell>
                <TableCell>Max</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statTable.map((row) => (
                <TableRow
                  key={row.entry}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.min}</TableCell>
                  <TableCell>{row.avg}</TableCell>
                  <TableCell>{row.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {userMessage && (
          <>
            <h3>{userMessage}</h3>
          </>
        )}        
     
        <br></br><br></br>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>
                  State with most bidets
                </TableCell>
                <TableCell>
                  {stateMostBidets}
                </TableCell>
                <TableCell>
                  {mostStateBidets}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Postal code with most bidets
                </TableCell>
                <TableCell>
                  {postalMostBidets}
                </TableCell>
                <TableCell>
                  {mostPostalBidets}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Households w/ single primary bathrooms<br></br>
                  and no other bathrooms
                </TableCell>
                <TableCell>
                  
                </TableCell>
                <TableCell>
                  {singlePrimaryBathrooms}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>          
        </TableContainer>
        <h3></h3>
      
      </div>

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
        }
      `}</style>
    </div>
  );
}
