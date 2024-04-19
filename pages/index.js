import '../src/asset/css/index.css';

import React, {useEffect, useState} from 'react';
import {ThemeProvider} from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {Button, CssBaseline} from "@mui/material";
import HeaderAppBar from "../app/components/common/HeaderAppBar";
import useThemeHandler from "../app/hooks/useThemeHandler";
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
  const [status, setStatus] = useState();

  useEffect(() => {
    setIpv4QueryUrl(localStorage.getItem('ipv4QueryUrl'));
    setIpv6QueryUrl(localStorage.getItem('ipv6QueryUrl'));
    setCloudflareEmail(localStorage.getItem('cloudflareEmail'));
    setCloudflareApiKey(localStorage.getItem('cloudflareApiKey'));
    setDnsRecordName(localStorage.getItem('dnsRecordName'));
  }, []);

  const handleConfigSave = () => {
    localStorage.setItem('ipv4QueryUrl', ipv4QueryUrl);
    localStorage.setItem('ipv6QueryUrl', ipv6QueryUrl);
    localStorage.setItem('cloudflareEmail', cloudflareEmail);
    localStorage.setItem('cloudflareApiKey', cloudflareApiKey);
    localStorage.setItem('dnsRecordName', dnsRecordName);
  };

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleDdnsUpdate = async () => {
    const ddnsLogic = new DdnsLogic(
      ipv4QueryUrl,
      ipv6QueryUrl,
      cloudflareEmail,
      cloudflareApiKey,
      dnsRecordName
    );
    try {
      await ddnsLogic.processUpdate();
      setAlertMessage("Success");
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertOpen(true);
    }
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
                  label="Global API Key"
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
                <span className="m-2">
                  <Button id="save" variant="contained" onClick={handleConfigSave}>Save Config</Button>
                </span>
                <span className="m-2">
                  <Button id="update" variant="contained" onClick={handleDdnsUpdate}>Update DDNS</Button>
                </span>
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