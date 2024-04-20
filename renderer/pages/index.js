import '../src/asset/css/index.css';

import React, {useEffect, useRef, useState} from 'react';
import {ThemeProvider} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {Button, CssBaseline, FormControlLabel, Switch} from "@mui/material";
import HeaderAppBar from "../app/components/common/HeaderAppBar";
import useThemeHandler from "../app/components/hooks/useThemeHandler";
import {DdnsLogic} from "../src/logic/DdnsLogic";
import Snackbar from "@mui/material/Snackbar";

function Index() {
  const {systemTheme, setSystemTheme, muiTheme} = useThemeHandler();
  const title = "Cloudflare DDNS";

  useEffect(() => {
    document.title = title;
  }, []);

  const [ipv4QueryUrl, setIpv4QueryUrl] = useState('');
  const [ipv6QueryUrl, setIpv6QueryUrl] = useState('');
  const [cloudflareEmail, setCloudflareEmail] = useState('');
  const [cloudflareApiKey, setCloudflareApiKey] = useState('');
  const [dnsRecordName, setDnsRecordName] = useState('');

  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    setIpv4QueryUrl(localStorage.getItem('ipv4QueryUrl'));
    setIpv6QueryUrl(localStorage.getItem('ipv6QueryUrl'));
    setCloudflareEmail(localStorage.getItem('cloudflareEmail'));
    setCloudflareApiKey(localStorage.getItem('cloudflareApiKey'));
    setDnsRecordName(localStorage.getItem('dnsRecordName'));

    const storedAutoStart = JSON.parse(localStorage.getItem('autoStart'));
    setAutoStart(storedAutoStart);
    setIsUpdating(storedAutoStart);
    isUpdatingRef.current = storedAutoStart;
  }, []);

  const handleConfigSave = () => {
    localStorage.setItem('ipv4QueryUrl', ipv4QueryUrl);
    localStorage.setItem('ipv6QueryUrl', ipv6QueryUrl);
    localStorage.setItem('cloudflareEmail', cloudflareEmail);
    localStorage.setItem('cloudflareApiKey', cloudflareApiKey);
    localStorage.setItem('dnsRecordName', dnsRecordName);

    localStorage.setItem('autoStart', JSON.stringify(autoStart));
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const isUpdatingRef = useRef(false);
  const [status, setStatus] = useState('');

  const updateLoop = async (ddnsLogic) => {
    while (isUpdatingRef.current) {
      try {
        const result = await ddnsLogic.processUpdate();
        if (result) {
          setStatus(`DNS Record updated: ${result}`);
        } else {
          setStatus("DNS Record is up to date");
        }
      } catch (err) {
        setStatus("Update failed: " + err.message);
        setAlertMessage(err.message);
        setAlertOpen(true);
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  };

  useEffect(() => {
    if (!isUpdating) {
      setStatus("Stopped");
      return;
    }
    const ddnsLogic = new DdnsLogic(
      ipv4QueryUrl,
      ipv6QueryUrl,
      cloudflareEmail,
      cloudflareApiKey,
      dnsRecordName
    );
    updateLoop(ddnsLogic);
  }, [isUpdating]);

  const handleUpdateButtonClick = async () => {
    setIsUpdating(!isUpdating);
    isUpdatingRef.current = !isUpdatingRef.current;
  };

  return (
    <>
      {muiTheme &&
        <ThemeProvider theme={muiTheme}>
          <CssBaseline enableColorScheme/>
          <HeaderAppBar
            title={title}
            systemTheme={systemTheme}
            setSystemTheme={setSystemTheme}
          />
          <div className="flex-center m-4">
            <div className="text-center">
              <div className="m-2">
                <TextField
                  label="IPv4 Query Url"
                  variant="outlined"
                  type="text"
                  value={ipv4QueryUrl}
                  onChange={(e) => setIpv4QueryUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="m-2">
                <TextField
                  label="IPv6 Query Url"
                  variant="outlined"
                  type="text"
                  value={ipv6QueryUrl}
                  onChange={(e) => setIpv6QueryUrl(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="m-2">
                <TextField
                  label="Cloudflare Email"
                  variant="outlined"
                  type="text"
                  value={cloudflareEmail}
                  onChange={(e) => setCloudflareEmail(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="m-2">
                <TextField
                  label="Cloudflare API Key"
                  variant="outlined"
                  type="text"
                  value={cloudflareApiKey}
                  onChange={(e) => setCloudflareApiKey(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="m-2">
                <TextField
                  label="DNS Record Name"
                  variant="outlined"
                  type="text"
                  value={dnsRecordName}
                  onChange={(e) => setDnsRecordName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="m-2">
                <FormControlLabel control={
                  <Switch checked={autoStart} onChange={e => setAutoStart(e.target.checked)}/>
                } label="Auto Start"/>
              </div>
              <div className="m-2">
                <Button id="save" variant="contained" onClick={handleConfigSave}>Save Config</Button>
              </div>
              <div className="m-2">
                <Button id="update" variant="contained" onClick={handleUpdateButtonClick}>
                  {isUpdating ? "Stop Update DDNS" : "Start Update DDNS"}
                </Button>
              </div>
              <div className="m-2">
                Status: {status}
              </div>
            </div>
          </div>
          <Snackbar
            open={alertOpen}
            autoHideDuration={6000}
            onClose={() => setAlertOpen(false)}
            message={alertMessage}
          />
        </ThemeProvider>
      }
    </>
  );
}

export default Index;