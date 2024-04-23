import {FormControlLabel, Switch} from "@mui/material";

export default function AutoStartSwitch({autoStart, setAutoStart}) {
  return (
    <div className="m-2">
      <FormControlLabel
        control={
          <Switch checked={autoStart} onChange={e => setAutoStart(e.target.checked)}/>
        }
        label="Auto Start"
      />
    </div>
  );
}