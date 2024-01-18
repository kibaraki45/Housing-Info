import {
  Alert,
  AlertTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Head from "next/head";
import React, { useState } from "react";
import { MANUFACTURERS } from "../../components/Manufacturers";

export default function ManufacturerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [colorTerm, setColorTerm] = useState(null);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const postURL = "http://127.0.0.1:8000/manufacturer-model-search/";

  // For paging
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  async function onClick(e) {
    e.preventDefault();
    await fetch(postURL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ search_str: searchQuery.toLowerCase() }),
    })
      .then((res) =>
        res.json().then((data) => ({ status: res.status, body: data }))
      )
      .then((res) => {
        const status = res.status;
        const msg = res.body.message;
        const query = searchQuery;
        console.log(res);

        if (status == 200) {
          setData(res.body.data);
          setColorTerm(query);
          setError("");
        } else if (status == 204) {
          setError("No valid results");
        } else {
          setError(msg);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("No valid results");
      });
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Manufacturer/Model Search</h1>
      <form onSubmit={onClick}>
        <TextField
          sx={{ mt: 2, minWidth: 250 }}
          className="text"
          onInput={(e) => {
            setSearchQuery(e.target.value);
          }}
          label="Manufacturer/Model"
          variant="outlined"
          placeholder="Search..."
          size="small"
        />
        <IconButton sx={{ mt: 2 }} aria-label="search" onClick={onClick}>
          <SearchIcon style={{ fill: "blue" }} />
        </IconButton>
      </form>
      {error.length < 1 && data.length > 0 && (
        <TableContainer sx={{ maxWidth: 900 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Manufacturer</TableCell>
                <TableCell align="center">Model Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? data.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                : data
              ).map((d, i) => (
                <TableRow key={i}>
                  <TableCell
                    sx={{
                      background: (color) => {
                        if (
                          d[0].toLowerCase().includes(colorTerm.toLowerCase())
                        )
                          return "#90EE90";
                      },
                    }}
                  >
                    {d[0]}
                  </TableCell>
                  <TableCell
                    sx={{
                      background: (color) => {
                        if (
                          d[1] != null &&
                          d[1].toLowerCase().includes(colorTerm.toLowerCase())
                        )
                          return "#90EE90";
                      },
                    }}
                  >
                    {d[1]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={3}
                  count={data.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
      {error.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error Loading Data</AlertTitle>
          {error}
        </Alert>
      )}
      <Button sx={{ mt: 4 }} variant="outlined" href={`/reports/`}>
        Reports
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
