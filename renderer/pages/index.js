import '../src/asset/css/index.css';

import React, {useEffect, useRef, useState} from 'react';
import {ThemeProvider} from "@mui/material/styles";
import {Button, CssBaseline, Snackbar} from "@mui/material";
import HeaderAppBar from "../app/components/common/HeaderAppBar";
import useThemeHandler from "../app/components/hooks/useThemeHandler";
import GlobalConfigForm from "../app/components/cloudflare-ddns/GlobalConfigForm";
import DNSRecordForm from "../app/components/cloudflare-ddns/DndRecordForm";
import AutoStartSwitch from "../app/components/cloudflare-ddns/AutoStartSwitch";
import {DdnsLogic} from "../src/logic/DdnsLogic";

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
  const [dnsRecordNames, setDnsRecordNames] = useState([]);

  const [autoStart, setAutoStart] = useState(false);

  useEffect(() => {
    setIpv4QueryUrl(localStorage.getItem('ipv4QueryUrl'));
    setIpv6QueryUrl(localStorage.getItem('ipv6QueryUrl'));
    setCloudflareEmail(localStorage.getItem('cloudflareEmail'));
    setCloudflareApiKey(localStorage.getItem('cloudflareApiKey'));
    setDnsRecordNames(JSON.parse(localStorage.getItem('dnsRecordNames')) || []);
    const storedAutoStart = JSON.parse(localStorage.getItem('autoStart') || false);
    setAutoStart(storedAutoStart);
    setIsUpdating(storedAutoStart);
    isUpdatingRef.current = storedAutoStart;
  }, []);

  const handleConfigSave = () => {
    localStorage.setItem('ipv4QueryUrl', ipv4QueryUrl);
    localStorage.setItem('ipv6QueryUrl', ipv6QueryUrl);
    localStorage.setItem('cloudflareEmail', cloudflareEmail);
    localStorage.setItem('cloudflareApiKey', cloudflareApiKey);
    localStorage.setItem('dnsRecordNames', JSON.stringify(dnsRecordNames));
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
        for await (const result of ddnsLogic.processUpdates()) {
          setStatus(result);
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
      dnsRecordNames
    );
    updateLoop(ddnsLogic);
  }, [isUpdating]);

  const handleUpdateButtonClick = async () => {
    setIsUpdating(!isUpdating);
    isUpdatingRef.current = !isUpdatingRef.current;
  };

  const [newDnsRecordName, setNewDnsRecordName] = useState('');

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
              <div className="flex-center">
                <GlobalConfigForm
                  ipv4QueryUrl={ipv4QueryUrl}
                  setIpv4QueryUrl={setIpv6QueryUrl}
                  ipv6QueryUrl={ipv6QueryUrl}
                  setIpv6QueryUrl={setIpv6QueryUrl}
                  cloudflareEmail={cloudflareEmail}
                  setCloudflareEmail={setCloudflareEmail}
                  cloudflareApiKey={cloudflareApiKey}
                  setCloudflareApiKey={setCloudflareApiKey}
                />
                <DNSRecordForm
                  dnsRecordNames={dnsRecordNames}
                  setDnsRecordNames={setDnsRecordNames}
                  newDnsRecordName={newDnsRecordName}
                  setNewDnsRecordName={setNewDnsRecordName}
                />
              </div>
              <AutoStartSwitch
                autoStart={autoStart}
                setAutoStart={setAutoStart}
              />
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