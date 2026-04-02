import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

interface AutoStartSwitchProps {
  autoStart: boolean;
  setAutoStart: (value: boolean) => void;
}

function AutoStartSwitch({autoStart, setAutoStart}: AutoStartSwitchProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked)}
        />
      }
      label="Start when app opens"
    />
  );
}

export default AutoStartSwitch;
