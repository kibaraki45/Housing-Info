import {
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ManufacturerInfo() {
  const [manInfo, setManInfo] = useState([]);
  const [error, setError] = useState("");

  const getURL = "http://127.0.0.1:8000/manufacturer-info/";

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(getURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        if (status == 200) {
          setError("");
          setManInfo(res.body.data);
        } else {
          setError(msg);
        }
      })
      .catch((err) => {
        setError(err);
      });

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Manufacturer Reports</h1>
      <h3 className="description">Top 25 Popular Manufacturers</h3>
      <TableContainer sx={{ maxWidth: 900 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 400 }}>Manufacturer</TableCell>
              <TableCell sx={{ minWidth: 100 }} align="center">
                Appliance Count
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error.length == 0 &&
              manInfo.map((data, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {data[0]}
                  </TableCell>
                  <TableCell align="center">{data[1]}</TableCell>
                  <TableCell>
                    <Button href={`/reports/manufacturer-drilldown/${data[0]}`}>
                      Drilldown
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error Loading Data</AlertTitle>
          {error}
        </Alert>
      )}
      {manInfo.length == 0 && <CircularProgress sx={{ mt: 3 }} />}
      <Button sx={{ mt: 3 }} href={`/reports`}>
        Return
      </Button>
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
