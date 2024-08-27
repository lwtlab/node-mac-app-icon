const child = require('child_process');
const {
  getAppIconByPid,
  getAppIconListByPid,
} = require('@lwtlab/node-mac-app-icon');

let finderPid = child.execSync(`ps -A | grep -m1 "MacOS/Finder" | awk '{print $1}'`);

if (!finderPid) {
  throw new Error('Finder process not found.');
}

finderPid = parseInt(finderPid.toString().trim(), 10);
getAppIconByPid(finderPid, { size: 10 }).then(
  (res) => console.log(res.toString('base64')),
  (err) => console.error(err)
);

getAppIconListByPid([finderPid], { size: 10 }).then(
  (res) => console.log(res[0].icon.toString('base64')),
  (err) => console.error(err)
);
