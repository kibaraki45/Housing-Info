import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { Stack } from "@mui/system";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

export default function Reports() {
  const router = useRouter();

  function onClick(page) {
    router.push(page);
  }

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">All Available Reports</h1>
      <div className="grid">
        <Stack spacing={2}>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/manufacturer-info/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Top 25 Popular Manufacturers &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/manufacturer-search/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Manufacturer/Model Search &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) =>
                onClick("/reports/average-tv-display-size-by-state/")
              }
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Average TV Display Size by State &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/fridge-freezer-report/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Extra Fridge/Freezer Report &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/laundry-center/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Laundry Center Report &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/bathroom-statistics/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Bathroom Statistics &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              onClick={(e) => onClick("/reports/household-averages/")}
            >
              <CardContent>
                <Typography variant="h5" component="div">
                  Household Averages by Radius &rarr;
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Stack>
      </div>
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

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }
      `}</style>
    </div>
  );
}
