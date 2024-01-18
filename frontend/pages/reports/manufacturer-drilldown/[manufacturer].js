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
} from "@mui/material";
import axios from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { MANUFACTURERS } from "../../../components/Manufacturers";

export default function ManufacturerDrilldown({ manufacturers }) {
  const router = useRouter();
  const { manufacturer } = router.query;

  const [appliances, setAppliances] = useState([]);
  const [dataErr, setDataErr] = useState(false);

  const getURL = "http://127.0.0.1:8000/manufacturer-drill-down/";

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(getURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appliance_mfr: manufacturer }),
      signal,
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;

        if (status == 200) {
          setAppliances(res.body.data);
          setDataErr("");
        } else {
          setDataErr(msg);
        }
      })
      .catch((err) => {
        console.error(err);
        setDataErr(err);
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
      <h1 className="title">{`${manufacturer} Drilldown Report`}</h1>
      <TableContainer sx={{ mt: 3, maxWidth: 500 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200 }}>Appliance</TableCell>
              <TableCell align="center">Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!dataErr &&
              appliances.map((appliance, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {appliance[0]}
                  </TableCell>
                  <TableCell align="center">{appliance[1]}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {dataErr && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error Loading Data</AlertTitle>
          There was an error loading {manufacturer}'s data, please refresh the
          page
        </Alert>
      )}
      <Button href={`/reports/manufacturer-info/`}>Return</Button>
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
  const res = await fetch("http://127.0.0.1:8000/manufacturer-list/", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  const manufacturers = data.data;

  return {
    paths: manufacturers.map((manufacturer) => {
      return {
        params: {
          manufacturer: manufacturer[0],
        },
      };
    }),
    fallback: false,
  };
}

export async function getStaticProps() {
  const res = await fetch("http://127.0.0.1:8000/manufacturer-list/", {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  const manufacturers = data.data;
  return {
    props: {
      manufacturers,
    },
  };
}
