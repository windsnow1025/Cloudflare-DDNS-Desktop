import '../src/asset/css/index.css';

import React, {useEffect, useRef, useState} from 'react';
import {ThemeProvider} from "@mui/material/styles";
import {
  Button,
  CssBaseline,
  FormControlLabel,
  Switch,
  Snackbar,
  TextField,
  ListItemText,
  IconButton, ListItem, List
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import HeaderAppBar from "../app/components/common/HeaderAppBar";
import useThemeHandler from "../app/components/hooks/useThemeHandler";
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
  const handleAddDnsRecordName = () => {
    if (newDnsRecordName && !dnsRecordNames.includes(newDnsRecordName)) {
      setDnsRecordNames([...dnsRecordNames, newDnsRecordName]);
      setNewDnsRecordName('');
    }
  };

  const handleRemoveDnsRecordName = (index) => {
    const newDnsRecordNames = [...dnsRecordNames];
    newDnsRecordNames.splice(index, 1);
    setDnsRecordNames(newDnsRecordNames);
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
              Global Configs:
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
              DNS Record Names:
              <div className="m-2">
                <div className="flex-around">
                  <TextField
                    label="Add DNS Record Name"
                    variant="outlined"
                    type="text"
                    value={newDnsRecordName}
                    onChange={(e) => setNewDnsRecordName(e.target.value)}
                    className="mt-2"
                  />
                  <span className="m-2 center"><Button variant="contained" onClick={handleAddDnsRecordName}>Add</Button></span>
                </div>
                <List>
                  {dnsRecordNames.map((name, index) => (
                    <ListItem key={index} secondaryAction={
                      <IconButton aria-label="delete" onClick={() => handleRemoveDnsRecordName(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }>
                      <ListItemText primary={name} />
                    </ListItem>
                  ))}
                </List>
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