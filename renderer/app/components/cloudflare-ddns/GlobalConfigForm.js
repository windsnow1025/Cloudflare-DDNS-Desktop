import {TextField, Typography} from "@mui/material";

export default function GlobalConfigForm({
                                           ipv4QueryUrl,
                                           setIpv4QueryUrl,
                                           ipv6QueryUrl,
                                           setIpv6QueryUrl,
                                           cloudflareEmail,
                                           setCloudflareEmail,
                                           cloudflareApiKey,
                                           setCloudflareApiKey
                                         }) {
  return (
    <div className="m-4">
      <Typography variant="h5">Global Configs:</Typography>
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
    </div>
  );
}