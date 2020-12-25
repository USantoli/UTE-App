import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import { timer, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import Page from "../../components/Page";
import { urls } from "../../routing";
import LoadingImage from "../../assets/Loading.gif";
import { Container, Title, Description, ExtraContainer } from "./style";
import { transferUte } from "../../helpers";
import { getItem, removeAll, setItem } from "../../helpers/storage";

const useStyles = makeStyles((theme) => ({
  goHome: {
    "&.MuiButton-containedSecondary": {
      backgroundColor: "#B5396C",
      height: "48px",
      borderRadius: "40px",
      width: "83.2%",
      maxWidth: "312px",
      textTransform: "none",
      fontFamily: "Montserrat",
      fontStyle: "normal",
      fontWeight: 500,
      fontSize: "20px",
      lineHeight: "24px",
      display: "flex",
      alignItems: "center",
      textAlign: "center",
      color: "#FFFFFF",
      border: "1px solid #B5396C",

      marginBottom: "32px",

      "&.Mui-disabled": {
        opacity: 0.6,
      },
    },
  },
}));

const Load: React.FC = () => {
  const classes = useStyles();
  const { push, replace } = useHistory();
  const destroy$ = new Subject();
  const runAfterXSeconds = timer(15000);
  const [showBackButton, setBackButtonVisibility] = useState<boolean>(false);
  const [isRepresentative, setAsRepresentative] = useState<boolean>(
    getItem("IsRepresentative") == "true"
  );

  const onGoHome = () => {
    replace(urls.home);
  };
  useEffect(() => {
    destroy$.next();
    runAfterXSeconds.pipe(takeUntil(destroy$)).subscribe(() => {
      setBackButtonVisibility(true);
    });
    if (
      !getItem("KeyStore") ||
      !getItem("ReceiverKey") ||
      !getItem("SendAmount")
    )
    replace(urls.start);
    else {
      if (getItem("Balance") < getItem("SendAmount")) replace(urls.balanceError);
      else {
        const payload = {
          keyStore: JSON.parse(getItem("KeyStore")),
          toAddress: getItem("ReceiverKey"),
          amount: getItem("SendAmount"),
          isTestingCenterUser: isRepresentative,
        };
        transferUte(payload).then((res) => {
          setItem("Success", true);
          if (res.data && res.status) replace(urls.success);
          else replace(urls.unknownError);
        });
      }
    }

    return () => {
      destroy$.next();
      destroy$.complete();
    };
  }, []);
  return (
    <Page
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <img
          style={{ marginTop: "7.881vh" }}
          width="120"
          height="120"
          src={LoadingImage}
          alt="Loading..."
        />
        <Title>Hang Tight! </Title>
        <Description>
          We are proccessing your payment. This can take up to two minutes.
        </Description>
        {!isRepresentative && showBackButton && (
          <ExtraContainer>
            <Description style={{ fontSize: "12.5px", marginBottom: "10px" }}>
              If the receiver has notified you that they received your
              transaction, you can safely exit this screen.
            </Description>
            <Button
              className={classes.goHome}
              onClick={onGoHome}
              variant="contained"
              color="secondary"
            >
              Go Home
            </Button>
          </ExtraContainer>
        )}
      </Container>
    </Page>
  );
};

export default Load;
