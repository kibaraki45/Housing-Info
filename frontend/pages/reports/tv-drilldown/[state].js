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
} from "@mui/material";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { STATES } from "../../../components/States";

export default function TVDrilldown({ states }) {
  const router = useRouter();
  const { state } = router.query;

  const [data, setData] = useState([]);
  const [dataErr, setDataErr] = useState(false);

  const postURL = "http://127.0.0.1:8000/tv-drill-down/";

  useEffect(() => {
    fetch(postURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state: state }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        setData(res.body.data);
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
      <h1 className="title"> Drilldown Report for {state}</h1>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Screen Type</TableCell>
              <TableCell>Maximum Resolution</TableCell>
              <TableCell>Average Display Size (in.)</TableCell>
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
                <TableCell>{data[2]}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button href={`/reports/average-tv-display-size-by-state/`}>
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
          font-size: 2rem;
        }
      `}</style>
    </div>
  );
}

export async function getStaticPaths() {
  return {
    paths: STATES.map((state) => {
      return {
        params: {
          state: state,
        },
      };
    }),
    fallback: false,
  };
}

export async function getStaticProps() {
  const states = STATES;
  return {
    props: {
      states,
    },
  };
}
