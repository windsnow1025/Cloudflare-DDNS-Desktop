import {IconButton, List, ListItem, ListItemText, TextField, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DNSRecordForm({
                                           dnsRecordNames,
                                           setDnsRecordNames,
                                           newDnsRecordName,
                                           setNewDnsRecordName
                                         }) {
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
    <div className="m-4">
      <Typography variant="h5">DNS Record Names:</Typography>
      <div className="flex-around m-2">
        <TextField
          label="Add DNS Record Name"
          variant="outlined"
          type="text"
          value={newDnsRecordName}
          onChange={(e) => setNewDnsRecordName(e.target.value)}
          className="mt-2"
        />
        <span className="m-2"><Button variant="contained" onClick={handleAddDnsRecordName}>Add</Button></span>
      </div>
      <List>
        {dnsRecordNames.map((name, index) => (
          <ListItem key={index} secondaryAction={
            <IconButton aria-label="delete" onClick={() => handleRemoveDnsRecordName(index)}>
              <DeleteIcon/>
            </IconButton>
          }>
            <ListItemText primary={name}/>
          </ListItem>
        ))}
      </List>
    </div>
  );
}