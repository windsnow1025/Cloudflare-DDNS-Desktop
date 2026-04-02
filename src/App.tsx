import {useEffect, useState} from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {useColorScheme} from "@mui/material/styles";
import ContrastIcon from "@mui/icons-material/Contrast";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AutoStartSwitch from "./components/AutoStartSwitch";
import DNSRecordForm from "./components/DNSRecordForm";
import GlobalConfigForm from "./components/GlobalConfigForm";
import IPQueryURLSelect from "./components/IPQueryURLSelect";
import {DefaultIPv4URLs, DefaultIPv6URLs, loadConfig, saveConfig} from "./lib/Config";
import {DDNS_Service, RecordStatus} from "./lib/DDNS_Service";

const ThemeCycle = ["system", "dark", "light"] as const;

function ThemeSwitch() {
  const {mode, setMode} = useColorScheme();

  const nextMode = () => {
    const currentIndex = ThemeCycle.indexOf(mode ?? "system");
    const next = ThemeCycle[(currentIndex + 1) % ThemeCycle.length];
    setMode(next);
  };

  const icon = mode === "dark"
    ? <DarkModeIcon/>
    : mode === "light"
      ? <LightModeIcon/>
      : <ContrastIcon/>;

  const label = mode === "dark"
    ? "Dark"
    : mode === "light"
      ? "Light"
      : "System";

  return (
    <Tooltip title={`Theme: ${label}`}>
      <IconButton
        onClick={nextMode}
        sx={{position: "fixed", top: 16, right: 16, zIndex: 1}}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}

function SectionCard({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" sx={{mb: 1.5}}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function App() {
  const [config] = useState(loadConfig);

  const [ipv4QueryUrl, setIpv4QueryUrl] = useState(config.ipv4QueryUrl);
  const [ipv6QueryUrl, setIpv6QueryUrl] = useState(config.ipv6QueryUrl);
  const [ipv4CustomOptions, setIpv4CustomOptions] = useState(config.ipv4CustomOptions);
  const [ipv6CustomOptions, setIpv6CustomOptions] = useState(config.ipv6CustomOptions);
  const [cloudflareEmail, setCloudflareEmail] = useState(config.cloudflareEmail);
  const [cloudflareApiKey, setCloudflareApiKey] = useState(config.cloudflareApiKey);
  const [dnsRecordNames, setDnsRecordNames] = useState(config.dnsRecordNames);
  const [autoStart, setAutoStart] = useState(config.autoStart);

  const [isUpdating, setIsUpdating] = useState(config.autoStart);
  const [statusEntries, setStatusEntries] = useState<RecordStatus[]>([]);
  const [hasError, setHasError] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const currentConfig = {
    ipv4QueryUrl,
    ipv6QueryUrl,
    ipv4CustomOptions,
    ipv6CustomOptions,
    cloudflareEmail,
    cloudflareApiKey,
    dnsRecordNames,
    autoStart,
  };

  const updateLoop = async (cancelFlag: {current: boolean}) => {
    const ddnsService = new DDNS_Service(
      ipv4QueryUrl,
      ipv6QueryUrl,
      cloudflareEmail,
      cloudflareApiKey,
      dnsRecordNames,
    );
    while (!cancelFlag.current) {
      try {
        const entries: RecordStatus[] = [];
        for await (const statuses of ddnsService.processUpdates()) {
          entries.push(...statuses);
        }
        setStatusEntries(entries);
        setHasError(false);
        setLastCheckTime(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatusEntries([]);
        setHasError(true);
        setLastCheckTime(new Date());
        setAlertMessage(message);
        setAlertOpen(true);
      }
      setCountdown(10);
      for (let i = 9; i >= 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (cancelFlag.current) return;
        setCountdown(i);
      }
    }
  };

  useEffect(() => {
    if (!isUpdating) {
      setStatusEntries([]);
      setHasError(false);
      return;
    }
    saveConfig(currentConfig);
    const cancelFlag = {current: false};
    updateLoop(cancelFlag);
    return () => {
      cancelFlag.current = true;
    };
  }, [isUpdating, ipv4QueryUrl, ipv6QueryUrl, cloudflareEmail, cloudflareApiKey, JSON.stringify(dnsRecordNames)]);

  const handleToggleUpdate = () => {
    setIsUpdating(!isUpdating);
  };

  return (
    <Container maxWidth="md">
      <ThemeSwitch/>
      <div className="flex-column gap-3 py-6">
        <Typography variant="h4" component="h1" sx={{fontWeight: 700}}>
          Cloudflare DDNS
        </Typography>

        <SectionCard title="IP Service">
          <div className="flex-column gap-3">
            <IPQueryURLSelect
              label="IPv4 Query URL"
              defaultURLs={DefaultIPv4URLs}
              customOptions={ipv4CustomOptions}
              onCustomOptionsChange={setIpv4CustomOptions}
              value={ipv4QueryUrl}
              onChange={setIpv4QueryUrl}
            />
            <IPQueryURLSelect
              label="IPv6 Query URL"
              defaultURLs={DefaultIPv6URLs}
              customOptions={ipv6CustomOptions}
              onCustomOptionsChange={setIpv6CustomOptions}
              value={ipv6QueryUrl}
              onChange={setIpv6QueryUrl}
            />
          </div>
        </SectionCard>

        <SectionCard title="Cloudflare Credentials">
          <GlobalConfigForm
            cloudflareEmail={cloudflareEmail}
            setCloudflareEmail={setCloudflareEmail}
            cloudflareApiKey={cloudflareApiKey}
            setCloudflareApiKey={setCloudflareApiKey}
          />
        </SectionCard>

        <SectionCard title="DNS Records">
          <DNSRecordForm
            dnsRecordNames={dnsRecordNames}
            setDnsRecordNames={setDnsRecordNames}
          />
        </SectionCard>

        <div className="flex-column-center gap-1">
          <Button
            variant="contained"
            color={isUpdating ? "error" : "primary"}
            onClick={handleToggleUpdate}
            size="large"
          >
            {isUpdating ? "Stop DDNS" : "Start DDNS"}
          </Button>
          <AutoStartSwitch
            autoStart={autoStart}
            setAutoStart={setAutoStart}
          />
        </div>

        {(isUpdating || statusEntries.length > 0 || hasError) && (
          <Card variant="outlined">
            <CardContent>
              <div className="flex-between-nowrap mb-2">
                <div className="flex-normal gap-1">
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={isUpdating ? (hasError ? "Error" : "Running") : "Stopped"}
                    color={isUpdating ? (hasError ? "error" : "success") : "default"}
                    size="small"
                  />
                </div>
                {lastCheckTime && (
                  <Typography variant="caption" color="text.secondary">
                    Last check: {lastCheckTime.toLocaleTimeString()}
                    {isUpdating && ` · Next in ${countdown}s`}
                  </Typography>
                )}
              </div>
              {hasError && (
                <Alert severity="error" variant="outlined">
                  {alertMessage}
                </Alert>
              )}
              {statusEntries.length > 0 && (
                <Table size="small">
                  <TableBody>
                    {statusEntries.map((s) => (
                      <TableRow key={`${s.record.name}-${s.record.type}`}>
                        <TableCell>{s.record.name}</TableCell>
                        <TableCell>{s.record.type}</TableCell>
                        <TableCell>{s.record.content}</TableCell>
                        <TableCell>
                          <Chip
                            label={s.updated ? "updated" : "up to date"}
                            color={s.updated ? "primary" : "default"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
      />
    </Container>
  );
}

export default App;
