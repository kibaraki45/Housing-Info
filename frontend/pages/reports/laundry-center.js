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
import React, { useState, useEffect } from "react"

export default function LaundryCenterReport() {
  const [data, setData] = useState([])
  const [data2, setData2] = useState([])
    // optional alerts to display
  const ALERT_NONE = ""
  const ALERT_ERROR = "error"
  const ALERT_INFO = "info"
  const ALERT_SUCCESS = "success"
  const [alertSeverity, setAlertSeverity] = useState("")
  const [alertMessage, setAlertMessage] = useState("")
  const [userMessage, setUserMessage] = useState("")
  const [userMessage2, setUserMessage2] = useState("")

  const getURL1 = "http://127.0.0.1:8000/laundry-center-report1/"
  const getURL2 = "http://127.0.0.1:8000/laundry-center-report2/"
  const reqOptions = {
    method: "GET",
    mode: "cors",
  }

  const getReportData = async () => {
    console.log("getReportData()");
    console.log("table1")
    fetch(getURL1, reqOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log(JSON.stringify(res))
        console.log("result: message:" + res["message"])
        if (res["message"] == "Success") {
          console.log("success: received success from Flask server")
          console.log("data:", JSON.stringify(res.data, null, 2))
          //console.log("data2:", JSON.stringify(res.data2, null, 2))
          setData(res.data)
          //setData2(res.data2)
          if (res.data.length == 0) {
            console.log("data is size zero")
            setUserMessage("No data to display")
          }
          //if (res.data2.length == 0) {
          //  console.log("data2 is size zero")
          //  setUserMessage2("No data to display")
          //}
        } else {
          console.log("error: display error message")
          setAlertSeverity(ALERT_ERROR)
          setAlertMessage(res["message"])
          return
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err))
        setAlertSeverity(ALERT_ERROR)
        setAlertMessage("misc error:" + err)
        return
      })
    console.log("table1")
    fetch(getURL2, reqOptions)
      .then((res) => res.json())
      .then((res) => {
        console.log(JSON.stringify(res))
        console.log("result: message:" + res["message"])
        if (res["message"] == "Success") {
          console.log("success: received success from Flask server")
          console.log("data:", JSON.stringify(res.data, null, 2))
          //console.log("data2:", JSON.stringify(res.data2, null, 2))
          setData2(res.data)
          //setData2(res.data2)
          if (res.data.length == 0) {
            console.log("data2 is size zero")
            setUserMessage("No data to display")
          }
          //if (res.data2.length == 0) {
          //  console.log("data2 is size zero")
          //  setUserMessage2("No data to display")
          //}
        } else {
          console.log("error: display error message")
          setAlertSeverity(ALERT_ERROR)
          setAlertMessage(res["message"])
          return
        }
      })
      .catch((err) => {
        console.log("misc error:", JSON.stringify(err))
        setAlertSeverity(ALERT_ERROR)
        setAlertMessage("misc error:" + err)
        return
      })
    
  }

  useEffect(() => {
    console.log("useEffect()")
    setAlertSeverity(ALERT_NONE)
    setAlertMessage("")
    getReportData()
  }, [])
  
  return (
      <div className="container">
        <Head>
          <title>Hemkraft Household Data</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <h1 className="title">Laundry Center Report</h1>

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
          <h2>Most common washer type and dryer heat source, by state</h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>State</TableCell>
                  <TableCell>Common Washer Type</TableCell>
                  <TableCell>Common Dryer Heat Src</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row[0]}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row[0]}
                    </TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{row[2]}</TableCell>
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
          <h2>Leading households with washing machine(s) but no dryer, by state</h2>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>State</TableCell>
                  <TableCell># households with washer(s) but no dryer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data2.map((row) => (
                  <TableRow
                    key={row[0]}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row[0]}
                    </TableCell>
                    <TableCell>{row[1]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {userMessage2 && (
            <>
              <h3>{userMessage2}</h3>
            </>
          )}

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
    )
}
