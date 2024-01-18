import { Button } from "@mui/material";
import Head from "next/head";
import { useEffect } from "react";

export default function SubmissionComplete() {
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Hemkraft Household Data</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Submission Complete</h1>
      <p className="description">
        Thank you for providing your information to Hemkraft!
      </p>
      <Button variant="outlined" href="/">
        Return to the main menu
      </Button>
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
